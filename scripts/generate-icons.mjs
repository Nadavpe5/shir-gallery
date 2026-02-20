import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputRaw = join(root, "public", "ShirYadgarlogo.png");
const inputClean = join(root, "public", ".ShirYadgarlogo-transparent.png");
const publicDir = join(root, "public");

// In-page logo sizes (aspect ~1.286). Icons (favicon, icon-192, etc.) stay old - not overwritten.
const sizes = [
  { name: "logo-64.png", w: 64, h: 50 },
  { name: "logo-96.png", w: 96, h: 75 },
  { name: "logo-256.png", w: 256, h: 199 },
];

async function main() {
  // Remove white/near-white background to full transparency (ImageMagick)
  try {
    execSync(
      `convert "${inputRaw}" -fuzz 20% -transparent white -fuzz 5% -transparent "#f5f5f5" -fuzz 3% -transparent "#fafafa" "${inputClean}"`,
      { stdio: "pipe" }
    );
  } catch {
    console.warn("ImageMagick convert not found or failed, using source as-is");
    if (existsSync(inputClean)) unlinkSync(inputClean);
  }
  const input = existsSync(inputClean) ? inputClean : inputRaw;

  const image = sharp(input);
  for (const { name, w, h } of sizes) {
    const out = join(publicDir, name);
    await image
      .clone()
      .resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
    console.log(`Generated ${name} (${w}x${h})`);
  }
  if (existsSync(inputClean)) unlinkSync(inputClean);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
