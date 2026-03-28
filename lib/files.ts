import fs from "fs/promises";
import path from "path";

const TMP_DIR = path.join(process.cwd(), "tmp");
const UPLOADS_DIR = path.join(TMP_DIR, "uploads");
const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

export async function ensureDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

export function getUploadsDir() {
  return UPLOADS_DIR;
}

export function getGeneratedDir() {
  return GENERATED_DIR;
}

export function getGeneratedUrl(filename: string) {
  return `/generated/${filename}`;
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  prefix: string
): Promise<string> {
  await ensureDirs();
  const ext = path.extname(originalName);
  const filename = `${prefix}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function saveGeneratedFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await ensureDirs();
  const filePath = path.join(GENERATED_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return getGeneratedUrl(filename);
}

export async function copyToGenerated(
  sourcePath: string,
  destFilename: string
): Promise<string> {
  await ensureDirs();
  const destPath = path.join(GENERATED_DIR, destFilename);
  await fs.copyFile(sourcePath, destPath);
  return getGeneratedUrl(destFilename);
}
