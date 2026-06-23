import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth-crypto";
import { saveImage } from "@/lib/storage";

// GET: Retrieve all active configurations
export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();
    
    // Construct config map with fallbacks
    const config: Record<string, string> = {
      restaurant_name: "PraVaDhya Foods",
      contact_number: "+91 99999 99999",
      whatsapp_number: "+91 99999 99999",
      address: "12-3-45, Traditional Street, Guntur, Andhra Pradesh, India",
      business_hours: "11:00 AM - 11:00 PM",
      social_media_links: '{"instagram":"https://instagram.com/pravadhya","facebook":"https://facebook.com/pravadhya"}',
      gst_percentage: "0",
      delivery_fee: "0",
      restaurant_logo: "",
      order_min_amount: "100",
      order_max_items: "30",
      ordering_status: "ENABLED",
      reservation_max_guests: "12",
      reservation_slot_duration: "120",
      reservations_status: "ENABLED",
      notify_email_alerts: "true",
      notify_whatsapp_alerts: "false",
      branding_primary_color: "#C5A880",
      branding_dark_theme_bg: "#121212",
    };
    
    settingsList.forEach((s) => {
      config[s.key] = s.value;
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading settings:", error);
    return NextResponse.json(
      { gst_percentage: "0", delivery_fee: "0", restaurant_name: "PraVaDhya Foods" },
      { status: 200 }
    );
  }
}

// PUT: Update dynamic system settings (Admin Only)
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated." }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Unauthorized." }, { status: 403 });
    }

    const body = await request.json();
    const { logoImage, logoImageName, ...settingsToUpdate } = body;

    // Handle branding logo upload if passed
    if (logoImage && logoImageName) {
      const logoUrl = await saveImage(logoImage, logoImageName);
      settingsToUpdate.restaurant_logo = logoUrl;
    }

    // Upsert each setting key-value pair in a transaction
    await prisma.$transaction(
      Object.keys(settingsToUpdate).map((key) => {
        return prisma.setting.upsert({
          where: { key },
          update: { value: String(settingsToUpdate[key]) },
          create: { key, value: String(settingsToUpdate[key]) },
        });
      })
    );

    // Log admin audit event
    await prisma.auditLog.create({
      data: {
        userId: payload.userId,
        role: "ADMIN",
        action: "SETTINGS_UPDATED",
        details: `Updated platform settings configuration parameters: ${Object.keys(settingsToUpdate).join(", ")}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully.",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update dynamic settings." },
      { status: 500 }
    );
  }
}
