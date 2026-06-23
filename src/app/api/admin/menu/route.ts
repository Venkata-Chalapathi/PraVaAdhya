import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveImage } from "@/lib/storage";

// GET: Fetch all menu items with category and ingredients for administrative management
export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      include: {
        category: true,
        ingredients: true,
      },
      orderBy: { category: { name: "asc" } },
    });
    
    // Group categories
    const categories = await prisma.category.findMany();

    return NextResponse.json({ success: true, items, categories });
  } catch (error) {
    console.error("Failed to read menu items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu items." },
      { status: 500 }
    );
  }
}

// POST: Add new menu item with optional image upload and ingredient list mapping
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, teluguName, isVeg, description, price, prepTime, categoryId, isFeatured, image, imageName, ingredients } = body;

    if (!name || !description || !price || !categoryId || !prepTime) {
      return NextResponse.json(
        { success: false, error: "Missing required menu item fields." },
        { status: 400 }
      );
    }

    // Handle image upload storage abstraction
    let imageUrl = "/menu/placeholder.jpg"; // Default fallback
    if (image && imageName) {
      imageUrl = await saveImage(image, imageName);
    }

    // Create item and ingredients inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const newItem = await tx.menuItem.create({
        data: {
          name,
          teluguName: teluguName || null,
          isVeg: isVeg !== false,
          description,
          price: Number(price),
          prepTime: Number(prepTime),
          isFeatured: Boolean(isFeatured),
          image: imageUrl,
          categoryId,
        },
      });

      // Map ingredients if provided
      if (Array.isArray(ingredients)) {
        for (const ing of ingredients) {
          if (ing.name) {
            await tx.menuItemIngredient.create({
              data: {
                menuItemId: newItem.id,
                name: ing.name,
                quantity: Number(ing.quantity || 0),
                unit: ing.unit || "grams",
                isAvailable: ing.isAvailable !== false,
              },
            });
          }
        }
      }

      // Log audit trail
      await tx.auditLog.create({
        data: {
          action: "MENU_UPDATED",
          details: `Created new menu item: ${name} (₹${price})`,
        },
      });

      return newItem;
    });

    return NextResponse.json({ success: true, item: result });
  } catch (error: any) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create menu item." },
      { status: 500 }
    );
  }
}

// PUT: Modify existing menu item, upload new images, and re-map ingredients
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, teluguName, isVeg, description, price, prepTime, categoryId, isFeatured, isAvailable, image, imageName, ingredients } = body;

    if (!id || !name || !description || !price || !categoryId || !prepTime) {
      return NextResponse.json(
        { success: false, error: "Missing required menu item properties." },
        { status: 400 }
      );
    }

    // Check if item exists
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Menu item not found." }, { status: 404 });
    }

    // Handle image upload storage abstraction if provided
    let imageUrl = existing.image;
    if (image && imageName) {
      imageUrl = await saveImage(image, imageName);
    }

    // Update menu item and ingredients
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.menuItem.update({
        where: { id },
        data: {
          name,
          teluguName: teluguName || null,
          isVeg: isVeg !== false,
          description,
          price: Number(price),
          prepTime: Number(prepTime),
          isFeatured: Boolean(isFeatured),
          isAvailable: Boolean(isAvailable),
          image: imageUrl,
          categoryId,
        },
      });

      // Clear old ingredients and re-insert new ones
      await tx.menuItemIngredient.deleteMany({
        where: { menuItemId: id },
      });

      if (Array.isArray(ingredients)) {
        for (const ing of ingredients) {
          if (ing.name) {
            await tx.menuItemIngredient.create({
              data: {
                menuItemId: id,
                name: ing.name,
                quantity: Number(ing.quantity || 0),
                unit: ing.unit || "grams",
                isAvailable: ing.isAvailable !== false,
              },
            });
          }
        }
      }

      // Log audit
      await tx.auditLog.create({
        data: {
          action: "MENU_UPDATED",
          details: `Modified menu item: ${name} (ID: ${id})`,
        },
      });

      return updatedItem;
    });

    return NextResponse.json({ success: true, item: result });
  } catch (error: any) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update menu item." },
      { status: 500 }
    );
  }
}

// DELETE: Delete menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Menu item ID is required." }, { status: 400 });
    }

    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Menu item not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Cascade delete is handled by schema.prisma onDelete: Cascade for ingredients and cartItems.
      // But orderItems uses onDelete: Restrict, so we must check if it has been ordered!
      const orderedCount = await tx.orderItem.count({
        where: { menuItemId: id },
      });

      if (orderedCount > 0) {
        // If already ordered, disable availability instead of deleting it to preserve order history integrity!
        await tx.menuItem.update({
          where: { id },
          data: { isAvailable: false },
        });
        
        await tx.auditLog.create({
          data: {
            action: "MENU_UPDATED",
            details: `Marked menu item ${item.name} unavailable instead of delete (linked to past orders).`,
          },
        });
      } else {
        // Delete item fully
        await tx.menuItem.delete({
          where: { id },
        });

        await tx.auditLog.create({
          data: {
            action: "MENU_UPDATED",
            details: `Fully deleted menu item: ${item.name}`,
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Menu item deleted/disabled successfully." });
  } catch (error: any) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete menu item." },
      { status: 500 }
    );
  }
}
