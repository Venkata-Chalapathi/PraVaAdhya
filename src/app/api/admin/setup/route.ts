import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// GET: Check if the initial admin setup is required
export async function GET() {
  try {
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) {
      // Create roles if they don't exist yet (in case seed didn't run)
      await prisma.role.createMany({
        data: [{ name: "ADMIN" }, { name: "CUSTOMER" }],
        skipDuplicates: true,
      });
    }

    const adminRoleRecord = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    const adminExists = await prisma.user.findFirst({
      where: { roleId: adminRoleRecord?.id },
    });

    return NextResponse.json({
      setupRequired: !adminExists,
    });
  } catch (error) {
    console.error("Error checking setup status:", error);
    return NextResponse.json(
      { error: "Database connection failed or not yet initialized." },
      { status: 500 }
    );
  }
}

// POST: Create the initial administrator user
export async function POST(request: Request) {
  try {
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) {
      return NextResponse.json(
        { error: "System roles are not initialized. Please run seeds." },
        { status: 500 }
      );
    }

    // Check if an admin already exists
    const adminExists = await prisma.user.findFirst({
      where: { roleId: adminRole.id },
    });

    if (adminExists) {
      return NextResponse.json(
        { error: "Setup has already been completed. Admin user already exists." },
        { status: 400 }
      );
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Name, valid email, and password (min 6 chars) are required." },
        { status: 400 }
      );
    }

    // Hash the password securely using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Administrator account created successfully. You can now log in.",
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error creating admin account:", error);
    return NextResponse.json(
      { error: "Failed to create administrator account." },
      { status: 500 }
    );
  }
}
