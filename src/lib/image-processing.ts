import "server-only";
import sharp from "sharp";
import { getObjectBuffer, uploadBuffer } from "./r2";

const WEB_MAX_WIDTH = 2400;
const WEB_QUALITY = 85;

export interface ThumbnailResult {
  url: string;
  width: number;
  height: number;
}

export async function generateWebThumbnail(
  fullKey: string,
  webKey: string
): Promise<ThumbnailResult> {
  const originalBuffer = await getObjectBuffer(fullKey);

  const pipeline = sharp(originalBuffer)
    .resize(WEB_MAX_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: WEB_QUALITY, progressive: true });

  const { data: webBuffer, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const url = await uploadBuffer(webKey, webBuffer, "image/jpeg");

  return { url, width: info.width, height: info.height };
}
