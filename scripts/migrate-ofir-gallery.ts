// One-time migration script for ofir gallery
// Run with: npx tsx scripts/migrate-ofir-gallery.ts

import { supabaseAdmin } from "../src/lib/supabase-server";
import { generateSectionZips } from "../src/lib/section-zip-generator";

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
    console.log("📦 Generating section ZIPs...\n");
    const results = await generateSectionZips(
      gallery.slug,
      highlights,
      galleryAssets,
      originals
    );
    
    console.log("\n✓ Generated section ZIPs:");
    if (results.highlights.url) {
      console.log(`  - highlights.zip: ${results.highlights.assetCount} photos, ${(results.highlights.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
    }
    if (results.gallery.url) {
      console.log(`  - gallery.zip: ${results.gallery.assetCount} photos, ${(results.gallery.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
    }
    if (results.originals.url) {
      console.log(`  - originals.zip: ${results.originals.assetCount} photos, ${(results.originals.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // 4. Update database
    console.log("\n💾 Updating database...");
    const { error: updateError } = await supabaseAdmin
      .from("galleries")
      .update({
        zip_highlights_url: results.highlights.url,
        zip_highlights_count: results.highlights.assetCount,
        zip_highlights_size: results.highlights.sizeBytes,
        zip_gallery_url: results.gallery.url,
        zip_gallery_count: results.gallery.assetCount,
        zip_gallery_size: results.gallery.sizeBytes,
        zip_originals_url: results.originals.url,
        zip_originals_count: results.originals.assetCount,
        zip_originals_size: results.originals.sizeBytes,
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
