import "server-only";
import archiver from "archiver";
import { PassThrough } from "stream";
import { uploadBuffer } from "./r2";

interface ZipAsset {
  full_url: string;
  filename: string | null;
}

export async function generateAndUploadZip(
  gallerySlug: string,
  assets: ZipAsset[]
): Promise<string> {
  const archive = archiver("zip", { zlib: { level: 5 } });
  const passThrough = new PassThrough();
  const chunks: Buffer[] = [];

  passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    passThrough.on("end", () => resolve(Buffer.concat(chunks)));
    passThrough.on("error", reject);
    archive.on("error", reject);
  });

  archive.pipe(passThrough);

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
        const arrayBuffer = await response.arrayBuffer();
        archive.append(Buffer.from(arrayBuffer), { name });
      }
    } catch (err) {
      console.warn(`[zip] Skipping ${name}:`, err instanceof Error ? err.message : err);
    }
  }

  await archive.finalize();
  const zipBuffer = await done;

  const zipKey = `${gallerySlug}/${gallerySlug}-gallery.zip`;
  const zipUrl = await uploadBuffer(zipKey, zipBuffer, "application/zip");

  console.log(`[zip] Generated ZIP: ${zipKey} (${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB, ${assets.length} photos)`);
  return zipUrl;
}
