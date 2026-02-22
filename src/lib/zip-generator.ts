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

export async function generateAndUploadZip(
  gallerySlug: string,
  assets: ZipAsset[],
  clientName?: string,
  shootDate?: string | null
): Promise<string> {
  const archive = archiver("zip", { zlib: { level: 5 } });

  const safeName = (clientName || gallerySlug).replace(/[^a-zA-Z0-9._-]/g, "_");
  const dateStr = shootDate
    ? new Date(shootDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const zipFilename = `${safeName}_${dateStr}`;
  const zipKey = `${gallerySlug}/${zipFilename}.zip`;

  const uploadPromise = s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: zipKey,
      Body: archive as unknown as Readable,
      ContentType: "application/zip",
    })
  );

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
        const nodeStream = Readable.fromWeb(webStream as import("stream/web").ReadableStream);
        archive.append(nodeStream, { name });
      }
    } catch (err) {
      console.warn(`[zip] Skipping ${name}:`, err instanceof Error ? err.message : err);
    }
  }

  await archive.finalize();
  await uploadPromise;

  console.log(`[zip] Generated and uploaded ZIP: ${zipKey} (${assets.length} photos)`);
  return `${PUBLIC_URL}/${zipKey}`;
}
