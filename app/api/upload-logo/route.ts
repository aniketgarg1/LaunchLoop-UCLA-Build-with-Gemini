import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/files";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const logoFile = formData.get("logo") as File | null;
    const qrFile = formData.get("qrCode") as File | null;

    const result: { logoPath?: string; qrCodePath?: string } = {};

    if (logoFile) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const prefix = `logo-${uuidv4().slice(0, 8)}`;
      result.logoPath = await saveUploadedFile(buffer, logoFile.name, prefix);
    }

    if (qrFile) {
      const bytes = await qrFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const prefix = `qr-${uuidv4().slice(0, 8)}`;
      result.qrCodePath = await saveUploadedFile(buffer, qrFile.name, prefix);
    }

    if (!result.logoPath && !result.qrCodePath) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
