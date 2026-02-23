// One-time migration script for ofir gallery
// Run with: npx tsx scripts/migrate-ofir-gallery.ts

import { createClient } from "@supabase/supabase-js";
import archiver from "archiver";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Create Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Create S3 client for R2
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

// Inline section ZIP generation
interface ZipAsset {
  full_url: string;
  filename: string | null;
}

interface SectionZipResult {
  url: string | null;
  sizeBytes: number;
  assetCount: number;
}

async function generateSectionZip(
  gallerySlug: string,
  sectionName: string,
  assets: ZipAsset[]
): Promise<SectionZipResult> {
  if (assets.length === 0) {
    console.log(`  [skip] ${sectionName} (0 assets)`);
    return { url: null, sizeBytes: 0, assetCount: 0 };
  }

  console.log(`  [gen] ${sectionName}.zip (${assets.length} assets)...`);

  const archive = archiver("zip", { zlib: { level: 5 } });
  const zipKey = `${gallerySlug}/${sectionName}.zip`;

  const usedNames = new Set<string>();
  for (const asset of assets) {
    let name = asset.filename || "photo.jpg";
    
    if (usedNames.has(name)) {
      const ext = name.lastIndexOf(".");
      const base = ext > 0 ? name.slice(0, ext) : name;
      const extension = ext > 0 ? name.slice(ext) : ".jpg";
      let counter = 2;
      while (usedNames.has(`${base}_${counter}${extension}`)) counter++;
      name = `${base}_${counter}${extension}`;
    }
    usedNames.add(name);

    try {
      const response = await fetch(asset.full_url);
      if (response.ok && response.body) {
        const webStream = response.body;
        const nodeStream = Readable.fromWeb(webStream as any);
        archive.append(nodeStream, { name });
      }
    } catch (err) {
      console.warn(`    [warn] Skipping ${name}:`, err instanceof Error ? err.message : err);
    }
  }

  archive.finalize();

  const chunks: Buffer[] = [];
  for await (const chunk of archive) {
    chunks.push(Buffer.from(chunk));
  }
  const zipBuffer = Buffer.concat(chunks);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: zipKey,
      Body: zipBuffer,
      ContentType: "application/zip",
      ContentLength: zipBuffer.length,
    })
  );

  const url = `${PUBLIC_URL}/${zipKey}`;
  console.log(`  ✓ Uploaded ${zipKey} (${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  return {
    url,
    sizeBytes: zipBuffer.length,
    assetCount: assets.length,
  };
}

async function migrateOfirGallery() {
  console.log("🚀 Starting migration for ofir gallery...\n");
  
  try {
    // 1. Fetch ofir gallery
    const { data: gallery, error: galleryError } = await supabaseAdmin
      .from("galleries")
      .select("id, slug, zip_url")
      .eq("slug", "ofir")
      .single();
      
    if (galleryError || !gallery) {
      throw new Error(`Ofir gallery not found: ${galleryError?.message || "No data"}`);
    }
    
    console.log(`✓ Found gallery: ${gallery.slug} (${gallery.id})`);
    
    // 2. Fetch assets grouped by type
    const { data: assets, error: assetsError } = await supabaseAdmin
      .from("gallery_assets")
      .select("id, full_url, filename, type")
      .eq("gallery_id", gallery.id)
      .order("sort_order", { ascending: true });
      
    if (assetsError || !assets) {
      throw new Error(`Failed to fetch assets: ${assetsError?.message || "No data"}`);
    }
    
    const highlights = assets.filter(a => a.type === "highlight");
    const galleryAssets = assets.filter(a => a.type === "gallery");
    const originals = assets.filter(a => a.type === "original");
    
    console.log(`✓ Assets found:`);
    console.log(`  - ${highlights.length} highlights`);
    console.log(`  - ${galleryAssets.length} gallery`);
    console.log(`  - ${originals.length} originals`);
    console.log(`  - ${assets.length} total\n`);
    
    // 3. Generate section ZIPs
    console.log("\n📦 Generating section ZIPs:");
    
    const highlightsResult = await generateSectionZip(gallery.slug, "highlights", highlights);
    const galleryResult = await generateSectionZip(gallery.slug, "gallery", galleryAssets);
    const originalsResult = await generateSectionZip(gallery.slug, "originals", originals);
    
    console.log("\n✓ Section ZIPs generated successfully");
    
    // 4. Update database
    console.log("\n💾 Updating database...");
    const { error: updateError } = await supabaseAdmin
      .from("galleries")
      .update({
        zip_highlights_url: highlightsResult.url,
        zip_highlights_count: highlightsResult.assetCount,
        zip_highlights_size: highlightsResult.sizeBytes,
        zip_gallery_url: galleryResult.url,
        zip_gallery_count: galleryResult.assetCount,
        zip_gallery_size: galleryResult.sizeBytes,
        zip_originals_url: originalsResult.url,
        zip_originals_count: originalsResult.assetCount,
        zip_originals_size: originalsResult.sizeBytes,
      })
      .eq("id", gallery.id);
      
    if (updateError) {
      throw new Error(`Failed to update database: ${updateError.message}`);
    }
    
    console.log("✓ Database updated\n");
    
    // 5. Note about old ZIP
    if (gallery.zip_url) {
      console.log("⚠️  Old ZIP still exists:");
      console.log(`   ${gallery.zip_url}`);
      console.log("   You can manually delete it from R2 after verifying section downloads work.\n");
    }
    
    console.log("✅ Migration complete!\n");
    console.log("Next steps:");
    console.log("1. Test section downloads in the gallery");
    console.log("2. Test 'Download All' merged download");
    console.log("3. Manually delete old ZIP from R2 if everything works");
    
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

migrateOfirGallery();
