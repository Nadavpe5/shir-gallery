import "server-only";
import archiver from "archiver";
import { Readable } from "stream";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

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

interface ZipAsset {
  full_url: string;
  filename: string | null;
}

interface SectionZipResult {
  url: string | null;
  sizeBytes: number;
  assetCount: number;
}

export async function generateSectionZips(
  gallerySlug: string,
  highlights: ZipAsset[],
  gallery: ZipAsset[],
  originals: ZipAsset[]
): Promise<{
  highlights: SectionZipResult;
  gallery: SectionZipResult;
  originals: SectionZipResult;
}> {
  const [highlightsResult, galleryResult, originalsResult] = await Promise.all([
    generateSectionZip(gallerySlug, "highlights", highlights),
    generateSectionZip(gallerySlug, "gallery", gallery),
    generateSectionZip(gallerySlug, "originals", originals),
  ]);

  return {
    highlights: highlightsResult,
    gallery: galleryResult,
    originals: originalsResult,
  };
}

async function generateSectionZip(
  gallerySlug: string,
  sectionName: string,
  assets: ZipAsset[]
): Promise<SectionZipResult> {
  if (assets.length === 0) {
    console.log(`[section-zip] Skipping ${sectionName} (0 assets)`);
    return { url: null, sizeBytes: 0, assetCount: 0 };
  }

  console.log(`[section-zip] Generating ${sectionName}.zip (${assets.length} assets)`);

  const archive = archiver("zip", { zlib: { level: 5 } });
  const zipKey = `${gallerySlug}/${sectionName}.zip`;

  const usedNames = new Set<string>();
  for (const asset of assets) {
    let name = asset.filename || "photo.jpg";
    
    // Handle duplicate filenames
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
        const nodeStream = Readable.fromWeb(webStream as import("stream/web").ReadableStream);
        archive.append(nodeStream, { name });
      } else {
        console.warn(`[section-zip] Failed to fetch ${name}: ${response.status}`);
      }
    } catch (err) {
      console.warn(`[section-zip] Skipping ${name}:`, err instanceof Error ? err.message : err);
    }
  }

  archive.finalize();

  // Buffer the stream in memory
  const chunks: Buffer[] = [];
  for await (const chunk of archive) {
    chunks.push(Buffer.from(chunk));
  }
  const zipBuffer = Buffer.concat(chunks);

  console.log(`[section-zip] Generated ${sectionName}.zip buffer: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);

  // Upload to R2
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: zipKey,
      Body: zipBuffer,
      ContentType: "application/zip",
      ContentLength: zipBuffer.length,
    })
  );

  console.log(`[section-zip] Uploaded ${zipKey}`);

  return {
    url: `${PUBLIC_URL}/${zipKey}`,
    sizeBytes: zipBuffer.length,
    assetCount: assets.length,
  };
}
