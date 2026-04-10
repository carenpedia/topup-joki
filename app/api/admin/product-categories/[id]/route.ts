import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => ({}));
    const { name, order } = body;

    const row = await prisma.productCategory.update({
      where: { id },
      data: {
        name: name ? String(name) : undefined,
        order: order !== undefined ? Number(order) : undefined,
      }
    });

    return NextResponse.json({ ok: true, item: row });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Check if products are using this category
    const count = await prisma.product.count({
      where: { productCategoryId: id }
    });

    if (count > 0) {
      return NextResponse.json({ error: "Kategori masih digunakan oleh produk. Pindahkan produk dulu." }, { status: 400 });
    }

    await prisma.productCategory.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
