import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    
    // Ensure folder exists inside public/uploads
    const relativeDir = join("uploads", folder);
    const absoluteDir = join(process.cwd(), "public", relativeDir);
    
    await mkdir(absoluteDir, { recursive: true });

    const path = join(absoluteDir, fileName);
    await writeFile(path, buffer);

    // Return the dynamic API URL for instant access
    const url = `/api/files/${folder}/${fileName}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
