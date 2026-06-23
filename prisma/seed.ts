import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  // 1. Seed Roles
  console.log("Seeding Roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });
  
  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: { name: "CUSTOMER" },
  });
  
  console.log(`Roles defined: ADMIN (${adminRole.id}), CUSTOMER (${customerRole.id})`);

  // 2. Seed Default Branch (Multi-branch readiness)
  console.log("Seeding Default Branch...");
  const defaultBranch = await prisma.restaurantBranch.upsert({
    where: { id: "default-branch-guntur" },
    update: {
      name: "PraVaDhya Foods - Guntur Main",
      address: "12-3-45, Traditional Street, Guntur, Andhra Pradesh, India",
      phone: "+91 99999 99999",
      operatingHours: "11:00 AM - 11:00 PM",
    },
    create: {
      id: "default-branch-guntur",
      name: "PraVaDhya Foods - Guntur Main",
      address: "12-3-45, Traditional Street, Guntur, Andhra Pradesh, India",
      phone: "+91 99999 99999",
      operatingHours: "11:00 AM - 11:00 PM",
    },
  });
  console.log(`Default branch seeded: ${defaultBranch.name} (${defaultBranch.id})`);

  // 3. Seed Restaurant Configuration Settings
  console.log("Seeding Configuration Settings...");
  const settingsData = [
    { key: "restaurant_name", value: "PraVaDhya Foods" },
    { key: "contact_number", value: "+91 99999 99999" },
    { key: "whatsapp_number", value: "+91 99999 99999" },
    { key: "address", value: "12-3-45, Traditional Street, Guntur, Andhra Pradesh, India" },
    { key: "business_hours", value: "11:00 AM - 11:00 PM" },
    { key: "social_media_links", value: '{"instagram":"https://instagram.com/pravadhya","facebook":"https://facebook.com/pravadhya"}' },
    { key: "gst_percentage", value: "0" },
    { key: "delivery_fee", value: "0" },
    { key: "restaurant_logo", value: "" },
    // Ordering Settings
    { key: "order_min_amount", value: "100" },
    { key: "order_max_items", value: "30" },
    { key: "ordering_status", value: "ENABLED" },
    // Reservation Settings
    { key: "reservation_max_guests", value: "12" },
    { key: "reservation_slot_duration", value: "120" }, // 120 minutes per reservation slot
    { key: "reservations_status", value: "ENABLED" },
    // Notification Settings
    { key: "notify_email_alerts", value: "true" },
    { key: "notify_whatsapp_alerts", value: "false" },
    // Branding Settings
    { key: "branding_primary_color", value: "#C5A880" },
    { key: "branding_dark_theme_bg", value: "#121212" },
  ];

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
  console.log("Settings keys successfully initialized.");

  // 4. Seed exactly 20 tables linked to default branch
  console.log("Seeding 20 physical dining tables...");
  const tableData = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 2 },
    { number: 3, capacity: 2 },
    { number: 4, capacity: 2 },
    { number: 5, capacity: 4 },
    { number: 6, capacity: 4 },
    { number: 7, capacity: 4 },
    { number: 8, capacity: 4 },
    { number: 9, capacity: 4 },
    { number: 10, capacity: 4 },
    { number: 11, capacity: 6 },
    { number: 12, capacity: 6 },
    { number: 13, capacity: 6 },
    { number: 14, capacity: 6 },
    { number: 15, capacity: 8 },
    { number: 16, capacity: 8 },
    { number: 17, capacity: 8 },
    { number: 18, capacity: 8 },
    { number: 19, capacity: 10 },
    { number: 20, capacity: 12 },
  ];

  for (const t of tableData) {
    await prisma.table.upsert({
      where: { number: t.number },
      update: { capacity: t.capacity, branchId: defaultBranch.id },
      create: {
        number: t.number,
        capacity: t.capacity,
        status: "AVAILABLE",
        branchId: defaultBranch.id,
      },
    });
  }
  console.log("Tables successfully seeded.");

  // Clean old menu items and ingredients to avoid constraints errors
  await prisma.menuItemIngredient.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});

  // 5. Seed Categories
  console.log("Seeding Categories...");
  const categoriesList = [
    "Starters",
    "Veg Curries",
    "Non-Veg Curries",
    "Biryanis",
    "Rice Items",
    "Tiffins",
    "Snacks",
    "Desserts",
    "Beverages",
  ];
  
  const categoryMap: Record<string, string> = {};
  for (const catName of categoriesList) {
    const cat = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
    categoryMap[catName] = cat.id;
  }

  // 6. Seed authentic Telugu cuisine items
  console.log("Seeding menu items...");
  const menuItemsData = [
    // Starters
    {
      name: "Chicken 65",
      teluguName: "చికెన్ 65",
      isVeg: false,
      description: "Crispy, deep-fried chicken chunks tossed in spicy yogurt sauce, curry leaves, and green chillies.",
      price: 220,
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90e8b?q=80&w=600&auto=format&fit=crop",
      prepTime: 12,
      category: "Starters",
      isFeatured: true,
      ingredients: ["Chicken", "Yogurt", "Curry Leaves", "Green Chillies", "Spices"]
    },
    {
      name: "Apollo Fish",
      teluguName: "అపోలో ఫిష్",
      isVeg: false,
      description: "Batter-fried fish fillets tossed in a spicy, tangy sauce with garlic, soy sauce, and green chillies.",
      price: 290,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop",
      prepTime: 15,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Fish", "Garlic", "Green Chillies", "Soy Sauce", "Spices"]
    },
    {
      name: "Paneer Tikka",
      teluguName: "పనీర్ టిక్కా",
      isVeg: true,
      description: "Spiced paneer cubes marinated in yogurt and herbs, skewered with onions and bell peppers, grilled in tandoor.",
      price: 200,
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=600&auto=format&fit=crop",
      prepTime: 15,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Paneer", "Yogurt", "Bell Peppers", "Onions", "Spices"]
    },
    // Veg Curries
    {
      name: "Paneer Butter Masala",
      teluguName: "పనీర్ బటర్ మసాలా",
      isVeg: true,
      description: "Rich, creamy cottage cheese cubes simmered in a mildly sweet tomato, butter, and cashew gravy.",
      price: 240,
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop",
      prepTime: 15,
      category: "Veg Curries",
      isFeatured: true,
      ingredients: ["Paneer", "Butter", "Cashews", "Tomato Gravy", "Spices"]
    },
    // Non-Veg Curries
    {
      name: "Gongura Mutton",
      teluguName: "గోంగూర మటన్",
      isVeg: false,
      description: "Tender chunks of fresh mutton slow-cooked in a tangy, sour sorrel leaves (gongura) gravy with local Guntur red chillies.",
      price: 490,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
      prepTime: 25,
      category: "Non-Veg Curries",
      isFeatured: true,
      ingredients: ["Mutton", "Gongura Leaves", "Guntur Red Chillies", "Spices"]
    },
    {
      name: "Natu Kodi Pulusu",
      teluguName: "నాటుకోడి పులుసు",
      isVeg: false,
      description: "Country-style free-range chicken cooked in a rich, thin spicy gravy featuring hand-pounded Andhra country masalas.",
      price: 460,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=600&auto=format&fit=crop",
      prepTime: 25,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Country Chicken", "Andhra Masala", "Onions", "Spices"]
    },
    {
      name: "Royyala Iguru",
      teluguName: "రొయ్యల ఇగురు",
      isVeg: false,
      description: "Traditional spicy prawn dry gravy cooked with caramelized onions, curry leaves, and local green chillies.",
      price: 380,
      image: "https://images.unsplash.com/photo-1559737607-9878a634f697?q=80&w=600&auto=format&fit=crop",
      prepTime: 20,
      category: "Non-Veg Curries",
      isFeatured: true,
      ingredients: ["Prawns", "Onions", "Curry Leaves", "Green Chillies", "Andhra Spices"]
    },
    // Biryanis
    {
      name: "Guntur Chicken Biryani",
      teluguName: "గుంటూరు చికెన్ బిర్యానీ",
      isVeg: false,
      description: "Spicy and intensely fragrant basmati rice layered with juicy chicken pieces marinated in hot Guntur chilli paste.",
      price: 420,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
      prepTime: 20,
      category: "Biryanis",
      isFeatured: true,
      ingredients: ["Basmati Rice", "Chicken", "Guntur Chilli Paste", "Biryani Spices"]
    },
    {
      name: "Ulavacharu Chicken Biryani",
      teluguName: "ఉలవచారు చికెన్ బిర్యానీ",
      isVeg: false,
      description: "Slow-cooked premium basmati rice infused with traditional horse gram broth (ulavacharu), layered with spiced chicken.",
      price: 380,
      image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop",
      prepTime: 20,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Chicken", "Horse Gram Broth", "Ghee"]
    },
    {
      name: "Mutton Dum Biryani",
      teluguName: "మటన్ దమ్ బిర్యానీ",
      isVeg: false,
      description: "Classic slow-cooked dum biryani with tender lamb chunks and premium basmati rice infused with saffron, mint, and cardamoms.",
      price: 480,
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
      prepTime: 25,
      category: "Biryanis",
      isFeatured: true,
      ingredients: ["Basmati Rice", "Mutton", "Saffron", "Mint", "Aromatic Spices"]
    },
    {
      name: "Prawns Biryani",
      teluguName: "రొయ్యల బిర్యానీ",
      isVeg: false,
      description: "Delicate basmati rice layered with spiced fresh prawns, coriander, mint, cardamoms, and pure ghee.",
      price: 440,
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop",
      prepTime: 20,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Prawns", "Pure Ghee", "Coriander", "Mint"]
    },
    // Rice Items
    {
      name: "Steamed Rice",
      teluguName: "అన్నం",
      isVeg: true,
      description: "Steamed premium sona masoori rice, served piping hot with fresh ghee and tomato pappu option.",
      price: 80,
      image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=600&auto=format&fit=crop",
      prepTime: 10,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Sona Masoori Rice", "Water"]
    },
    {
      name: "Curd Rice",
      teluguName: "దద్దోజనం",
      isVeg: true,
      description: "Soft cooked rice mixed with fresh yogurt and tempered with mustard seeds, curry leaves, and green chillies.",
      price: 120,
      image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=600&auto=format&fit=crop",
      prepTime: 5,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Rice", "Fresh Yogurt", "Mustard Seeds", "Curry Leaves", "Green Chillies"]
    },
    // Tiffins
    {
      name: "Pesarattu",
      teluguName: "పెసరట్టు",
      isVeg: true,
      description: "Nutritious whole green gram crepe topped with finely chopped onions, ginger, and green chillies, served with ginger chutney.",
      price: 140,
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop",
      prepTime: 10,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Green Gram", "Ginger", "Green Chillies", "Onions", "Ginger Chutney"]
    },
    {
      name: "Idli",
      teluguName: "ఇడ్లీ",
      isVeg: true,
      description: "Steamed soft rice-lentil cakes served with peanut chutney, ginger chutney, and fresh sambar.",
      price: 80,
      image: "https://images.unsplash.com/photo-1589302168068-9646c49d4d67?q=80&w=600&auto=format&fit=crop",
      prepTime: 5,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Rice Batter", "Urad Dal", "Peanut Chutney", "Sambar"]
    },
    {
      name: "Ghee Dosa",
      teluguName: "నెయ్యి దోశ",
      isVeg: true,
      description: "Crispy rice-lentil crepe griddled with pure desi ghee, served with coconut chutney and sambar.",
      price: 120,
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop",
      prepTime: 8,
      category: "Tiffins",
      isFeatured: true,
      ingredients: ["Dosa Batter", "Desi Ghee", "Coconut Chutney", "Sambar"]
    },
    {
      name: "Upma",
      teluguName: "ఉప్మా",
      isVeg: true,
      description: "Roasted semolina cooked with carrots, green peas, cashews, and ghee, served with peanut chutney.",
      price: 90,
      image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop",
      prepTime: 7,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Semolina", "Carrots", "Green Peas", "Cashews", "Desi Ghee"]
    },
    // Snacks
    {
      name: "Punugulu",
      teluguName: "పునుగులు",
      isVeg: true,
      description: "Crisp, deep-fried fritters made of fermented rice-urad dal batter, served with spicy ginger chutney.",
      price: 99,
      image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop",
      prepTime: 10,
      category: "Snacks",
      isFeatured: true,
      ingredients: ["Rice Batter", "Urad Dal", "Ginger Chutney", "Oil"]
    },
    {
      name: "Mirchi Bajji",
      teluguName: "మిర్చి బజ్జీ",
      isVeg: true,
      description: "Deep-fried batter coated banana chillies stuffed with onion, lemon juice, and chaat spices.",
      price: 110,
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop",
      prepTime: 10,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Banana Chillies", "Gram Flour", "Onions", "Lemon Juice", "Oil"]
    },
    // Desserts
    {
      name: "Bobbatlu",
      teluguName: "బొబ్బట్లు",
      isVeg: true,
      description: "Sweet delicate flatbread filled with sweet split chickpea-jaggery cardamoms paste, griddled with pure desi ghee.",
      price: 90,
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop",
      prepTime: 8,
      category: "Desserts",
      isFeatured: true,
      ingredients: ["Bengal Gram", "Jaggery", "All-purpose Flour", "Desi Ghee", "Cardamom"]
    },
    {
      name: "Double Ka Meetha",
      teluguName: "డబుల్ కా మీఠా",
      isVeg: true,
      description: "Traditional Hyderabadi fried-bread dessert soaked in saffron-infused milk syrup, garnished with ghee-fried almonds and cashews.",
      price: 120,
      image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop",
      prepTime: 10,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Bread Slices", "Saffron Milk", "Sugar Syrup", "Almonds", "Cashews"]
    },
    {
      name: "Gulab Jamun",
      teluguName: "గులాబ్ జామున్",
      isVeg: true,
      description: "Soft, golden-brown berry-sized balls made of milk solids, soaked in warm cardamom sugar syrup.",
      price: 100,
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
      prepTime: 5,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Milk Solids", "Sugar Syrup", "Cardamom"]
    },
    // Beverages
    {
      name: "Filter Coffee",
      teluguName: "ఫిల్టర్ కాఫీ",
      isVeg: true,
      description: "South Indian filter coffee frothed with boiling hot milk and poured dynamically from brass dabarah and tumbler.",
      price: 60,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Coffee Powder", "Chicory", "Milk", "Sugar"]
    },
    {
      name: "Badam Milk",
      teluguName: "బాదాం పాలు",
      isVeg: true,
      description: "Creamy, chilled milk slow-simmered with almond paste, saffron threads, and green cardamom, garnished with nut slivers.",
      price: 80,
      image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600&auto=format&fit=crop",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Milk", "Almond Paste", "Saffron", "Cardamom", "Nuts"]
    },
    {
      name: "Fresh Lime Soda",
      teluguName: "ఫ్రెష్ లైమ్ సోడా",
      isVeg: true,
      description: "Refreshing bubbly soda mixed with freshly squeezed lime juice, salt, and sugar syrup, served chilled.",
      price: 70,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop",
      prepTime: 4,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Lime Juice", "Soda", "Sugar Syrup", "Salt", "Ice"]
    }
  ];

  for (const item of menuItemsData) {
    const catId = categoryMap[item.category];
    if (!catId) {
      console.warn(`Category not found for: ${item.name} (${item.category})`);
      continue;
    }
    
    const dbItem = await prisma.menuItem.create({
      data: {
        name: item.name,
        teluguName: item.teluguName,
        isVeg: item.isVeg,
        description: item.description,
        price: item.price,
        image: item.image,
        prepTime: item.prepTime,
        isFeatured: item.isFeatured,
        categoryId: catId,
        isAvailable: true,
      },
    });

    // Seed ingredients for this item (Inventory preparation layer)
    for (const ingName of item.ingredients) {
      await prisma.menuItemIngredient.create({
        data: {
          menuItemId: dbItem.id,
          name: ingName,
          quantity: 100, // Seed placeholder quantity
          unit: "grams",
          isAvailable: true,
        }
      });
    }
  }
  console.log("Menu items and ingredients list successfully seeded.");

  // 7. Seed Featured Reviews for the Homepage testimonials
  console.log("Seeding Reviews...");
  await prisma.review.deleteMany({});
  const reviewSeeds = [
    {
      name: "Srinivas R.",
      email: "srinivas@gmail.com",
      rating: 5,
      comment: "The Gongura Mutton here tastes exactly like my grandmother's recipe in Tenali! Truly authentic Telugu flavors.",
      status: "APPROVED",
      isFeatured: true,
    },
    {
      name: "Lakshmi K.",
      email: "lakshmi.k@yahoo.com",
      rating: 5,
      comment: "Best Pesarattu and filter coffee in town. The premium ambiance and quick service make it a weekly spot for our family.",
      status: "APPROVED",
      isFeatured: true,
    },
    {
      name: "Anirudh G.",
      email: "anirudh.g@outlook.com",
      rating: 5,
      comment: "We booked a table for a family dinner. Outstanding Telugu hospitality and the Guntur Chicken Biryani was spectacular.",
      status: "APPROVED",
      isFeatured: true,
    },
  ];

  for (const r of reviewSeeds) {
    await prisma.review.create({ data: r });
  }
  console.log("Homepage testimonials successfully seeded.");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
