import "server-only";
import sharp from "sharp";
import { getObjectBuffer, uploadBuffer } from "./r2";

const WEB_MAX_WIDTH = 1200;
const WEB_QUALITY = 80;

export async function generateWebThumbnail(
  fullKey: string,
  webKey: string
): Promise<string> {
  const originalBuffer = await getObjectBuffer(fullKey);

  const webBuffer = await sharp(originalBuffer)
    .resize(WEB_MAX_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: WEB_QUALITY, progressive: true })
    .toBuffer();

  return uploadBuffer(webKey, webBuffer, "image/jpeg");
}
