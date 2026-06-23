import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
  ssl: fs.existsSync("./supabase-ca.crt")
    ? {
        ca: fs.readFileSync("./supabase-ca.crt").toString(),
      }
    : {
        rejectUnauthorized: false,
      },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed with 90 premium items...");

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

  // 2. Seed Default Branch
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
    { key: "order_min_amount", value: "100" },
    { key: "order_max_items", value: "30" },
    { key: "ordering_status", value: "ENABLED" },
    { key: "reservation_max_guests", value: "12" },
    { key: "reservation_slot_duration", value: "120" },
    { key: "reservations_status", value: "ENABLED" },
    { key: "notify_email_alerts", value: "true" },
    { key: "notify_whatsapp_alerts", value: "false" },
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

  // 6. Seed exactly 90 premium items (10 per category)
  console.log("Seeding 90 premium menu items...");
  const menuItemsData = [
    // --- STARTERS (10) ---
    {
      name: "Chicken 65",
      teluguName: "చికెన్ 65",
      isVeg: false,
      description: "Spicy, deep-fried chicken cubes marinated in ginger, garlic, and Guntur red chillies, garnished with crispy curry leaves.",
      price: 260,
      image: "/menu/chicken_65.png",
      prepTime: 12,
      category: "Starters",
      isFeatured: true,
      ingredients: ["Chicken Chunks", "Yogurt", "Ginger-Garlic", "Curry Leaves"]
    },
    {
      name: "Apollo Fish",
      teluguName: "అపోలో ఫిష్",
      isVeg: false,
      description: "Crispy, golden-fried fish fillets tossed in a rich, tangy spiced yogurt sauce with green chillies.",
      price: 320,
      image: "/menu/apollo_fish.png",
      prepTime: 15,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Fish Fillets", "Spiced Yogurt", "Green Chillies", "Garlic"]
    },
    {
      name: "Chilli Chicken",
      teluguName: "చిల్లీ చికెన్",
      isVeg: false,
      description: "Indo-Chinese style crispy stir-fried chicken tossed with crunchy bell peppers, onions, and spicy green chillies.",
      price: 250,
      image: "/menu/chilli_chicken.png",
      prepTime: 12,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Chicken Chunks", "Bell Peppers", "Soy Sauce", "Green Chillies"]
    },
    {
      name: "Pepper Chicken",
      teluguName: "పెప్పర్ చికెన్",
      isVeg: false,
      description: "Hot dry chicken stir-fry seasoned heavily with freshly crushed black peppercorns, roasted fennel, and fresh curry leaves.",
      price: 260,
      image: "/menu/pepper_chicken.png",
      prepTime: 14,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Chicken Pieces", "Crushed Black Pepper", "Fennel Seeds", "Curry Leaves"]
    },
    {
      name: "Chicken Majestic",
      teluguName: "చికెన్ మెజెస్టిక్",
      isVeg: false,
      description: "Dry fried chicken strips coated in a smooth, tangy spiced buttermilk batter, griddled with garlic.",
      price: 280,
      image: "/menu/chicken_majestic.png",
      prepTime: 14,
      category: "Starters",
      isFeatured: true,
      ingredients: ["Chicken Strips", "Buttermilk", "Garlic Cloves", "Soy Sauce"]
    },
    {
      name: "Paneer 65",
      teluguName: "పన్నీర్ 65",
      isVeg: true,
      description: "Crisp golden-fried fresh cottage cheese cubes seasoned with Southern spices and tossed in a yogurt sauce.",
      price: 220,
      image: "/menu/paneer_65.png",
      prepTime: 10,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Cottage Cheese", "Southern Spices", "Curry Leaves", "Yogurt"]
    },
    {
      name: "Crispy Corn",
      teluguName: "క్రిస్పీ కార్న్",
      isVeg: true,
      description: "Golden deep-fried sweet corn kernels tossed with finely chopped onions, spring onions, and dry spices.",
      price: 180,
      image: "/menu/crispy_corn.png",
      prepTime: 8,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Sweet Corn", "Onions", "Spring Onions", "Dry Spices"]
    },
    {
      name: "Gobi Manchurian",
      teluguName: "గోబీ మంచూరియా",
      isVeg: true,
      description: "Cauliflower florets battered and deep-fried, then tossed in a sweet, spicy, and tangy Indo-Chinese sauce.",
      price: 190,
      image: "/menu/gobi_manchurian.png",
      prepTime: 10,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Cauliflower", "Manchurian Sauce", "Spring Onions", "Ginger"]
    },
    {
      name: "Veg Manchurian",
      teluguName: "వెజ్ మంచూరియా",
      isVeg: true,
      description: "Deep-fried mixed vegetable balls simmered in a thick, savory and slightly sweet dark soy sauce.",
      price: 190,
      image: "/menu/veg_manchurian.png",
      prepTime: 12,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Mixed Vegetables", "Soy Sauce", "Garlic", "Spring Onions"]
    },
    {
      name: "Baby Corn Fry",
      teluguName: "బేబీ కార్న్ ఫ్రై",
      isVeg: true,
      description: "Crispy baby corn fingers coated in a light batter, deep-fried to a perfect golden crunch and seasoned.",
      price: 200,
      image: "/menu/baby_corn_fry.png",
      prepTime: 10,
      category: "Starters",
      isFeatured: false,
      ingredients: ["Baby Corn", "Light Batter", "Spices", "Chilli Powder"]
    },

    // --- VEG CURRIES (10) ---
    {
      name: "Gutti Vankaya Curry",
      teluguName: "గుత్తి వంకాయ కూర",
      isVeg: true,
      description: "Andhra delicacy featuring tender brinjals stuffed with a roasted peanut, sesame, and dry coconut paste gravy.",
      price: 220,
      image: "/menu/gutti_vankaya_curry.png",
      prepTime: 18,
      category: "Veg Curries",
      isFeatured: true,
      ingredients: ["Tender Brinjals", "Roasted Peanuts", "Sesame Seeds", "Dry Coconut"]
    },
    {
      name: "Bendakaya Fry",
      teluguName: "బెండకాయ వేపుడు",
      isVeg: true,
      description: "Crispy griddled okra stir-fry tossed with fresh grated coconut, dry red chillies, and roasted peanuts.",
      price: 180,
      image: "/menu/bendakaya_fry.png",
      prepTime: 12,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Okra", "Grated Coconut", "Dry Red Chillies", "Peanuts"]
    },
    {
      name: "Beerakaya Curry",
      teluguName: "బీరకాయ కూర",
      isVeg: true,
      description: "Mild ridge gourd curry cooked in fresh milk and tempered with mustard seeds, lentils, and curry leaves.",
      price: 190,
      image: "/menu/beerakaya_curry.png",
      prepTime: 12,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Ridge Gourd", "Fresh Milk", "Lentils", "Mustard Seeds"]
    },
    {
      name: "Dosakaya Pappu",
      teluguName: "దోసకాయ పప్పు",
      isVeg: true,
      description: "Tangy Andhra style yellow dal cooked with diced yellow cucumber, green chillies, and aromatic ghee.",
      price: 160,
      image: "/menu/dosakaya_pappu.png",
      prepTime: 10,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Toor Dal", "Yellow Cucumber", "Green Chillies", "Cow Ghee"]
    },
    {
      name: "Tomato Pappu",
      teluguName: "టొమాటో పప్పు",
      isVeg: true,
      description: "A comforting lentil stew prepared with rich ripe tomatoes, green chillies, and tempered with garlic and cumin.",
      price: 160,
      image: "/menu/tomato_pappu.png",
      prepTime: 10,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Toor Dal", "Ripe Tomatoes", "Garlic", "Cumin Seeds"]
    },
    {
      name: "Palak Paneer",
      teluguName: "పాలక్ పన్నీర్",
      isVeg: true,
      description: "Soft fresh cottage cheese cubes cooked in a smooth, creamy spiced fresh spinach gravy.",
      price: 240,
      image: "/menu/palak_paneer.png",
      prepTime: 15,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Fresh Paneer", "Spinach Puree", "Cream", "Ginger"]
    },
    {
      name: "Kadai Paneer",
      teluguName: "కడాయి పన్నీర్",
      isVeg: true,
      description: "Paneer cubes cooked with crispy bell peppers, onions, and freshly ground kadai coriander-chilli spices.",
      price: 250,
      image: "/menu/kadai_paneer.png",
      prepTime: 14,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Cottage Cheese", "Bell Peppers", "Onions", "Kadai Spices"]
    },
    {
      name: "Aloo Gobi",
      teluguName: "ఆలూ గోబీ",
      isVeg: true,
      description: "A classic home-style dry curry cooked with diced potatoes and cauliflower florets with turmeric.",
      price: 190,
      image: "/menu/aloo_gobi.png",
      prepTime: 12,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Diced Potatoes", "Cauliflower", "Turmeric", "Coriander"]
    },
    {
      name: "Mushroom Masala",
      teluguName: "మష్రూమ్ మసాలా",
      isVeg: true,
      description: "Fresh button mushrooms cooked in a spicy, caramelized onion and tomato paste gravy.",
      price: 240,
      image: "/menu/mushroom_masala.png",
      prepTime: 15,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Button Mushrooms", "Onion Paste", "Tomatoes", "Spices"]
    },
    {
      name: "Mixed Veg Curry",
      teluguName: "మిక్స్డ్ వెజ్ కూర",
      isVeg: true,
      description: "A colorful assortment of carrots, peas, beans, and potatoes cooked in a mildly spiced cashew gravy.",
      price: 210,
      image: "/menu/mixed_veg_curry.png",
      prepTime: 15,
      category: "Veg Curries",
      isFeatured: false,
      ingredients: ["Carrots", "Peas", "Beans", "Cashew Paste"]
    },

    // --- NON-VEG CURRIES (10) ---
    {
      name: "Andhra Chicken Curry",
      teluguName: "ఆంధ్రా చికెన్ కూర",
      isVeg: false,
      description: "Bone-in chicken slow-cooked in a rich, dry coconut, cashew, and spicy Guntur red chilli gravy.",
      price: 290,
      image: "/menu/andhra_chicken_curry.png",
      prepTime: 18,
      category: "Non-Veg Curries",
      isFeatured: true,
      ingredients: ["Bone-in Chicken", "Dry Coconut", "Cashew Paste", "Guntur Red Chillies"]
    },
    {
      name: "Natukodi Pulusu",
      teluguName: "నాటుకోడి పులుసు",
      isVeg: false,
      description: "Spicy, thin country chicken gravy cooked with free-range country chicken and hand-ground rustic spices.",
      price: 380,
      image: "/menu/natukodi_pulusu.png",
      prepTime: 25,
      category: "Non-Veg Curries",
      isFeatured: true,
      ingredients: ["Country Chicken", "Rustic Masala", "Tamarind Juice", "Curry Leaves"]
    },
    {
      name: "Chicken Chettinad",
      teluguName: "చికెన్ చెట్టినాడ్",
      isVeg: false,
      description: "Spicy, dark chicken gravy cooked with a roasted coconut paste, cardamoms, and black pepper.",
      price: 310,
      image: "/menu/chicken_chettinad.png",
      prepTime: 20,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Chicken Pieces", "Roasted Coconut", "Black Pepper", "Cardamoms"]
    },
    {
      name: "Mutton Curry",
      teluguName: "మటన్ కూర",
      isVeg: false,
      description: "Slow-cooked tender baby goat meat simmered in a rich, traditional spiced onion and tomato gravy.",
      price: 360,
      image: "/menu/mutton_curry.png",
      prepTime: 25,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Baby Goat Meat", "Onions", "Tomatoes", "Traditional Spices"]
    },
    {
      name: "Mutton Rogan Josh",
      teluguName: "మటన్ రోగన్ జోష్",
      isVeg: false,
      description: "Kashmiri style aromatic lamb curry cooked with dry ginger, fennel seeds, and Kashmiri red chillies.",
      price: 380,
      image: "/menu/mutton_rogan_josh.png",
      prepTime: 25,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Tender Lamb", "Kashmiri Red Chillies", "Fennel Seeds", "Ginger"]
    },
    {
      name: "Gongura Mutton",
      teluguName: "గోంగూర మటన్",
      isVeg: false,
      description: "Andhra specialty: Tender goat meat slow-cooked in a tangy, sour sorrel leaves (gongura) thick gravy.",
      price: 390,
      image: "/menu/gongura_mutton.png",
      prepTime: 25,
      category: "Non-Veg Curries",
      isFeatured: true,
      ingredients: ["Goat Meat", "Gongura Leaves", "Green Chillies", "Ghee"]
    },
    {
      name: "Fish Curry",
      teluguName: "చేపల పులుసు",
      isVeg: false,
      description: "Nellore style spicy and tangy fish curry cooked with fresh raw mango, tamarind, and local catch.",
      price: 340,
      image: "/menu/fish_curry.png",
      prepTime: 20,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Fresh Fish Cutlet", "Raw Mango", "Tamarind", "Spices"]
    },
    {
      name: "Royyala Iguru",
      teluguName: "రొయ్యల ఇగురు",
      isVeg: false,
      description: "Andhra style semi-dry prawns masala cooked with green chillies, curry leaves, and local herbs.",
      price: 360,
      image: "/menu/royyala_iguru.png",
      prepTime: 18,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Prawns", "Green Chillies", "Curry Leaves", "Onions"]
    },
    {
      name: "Egg Curry",
      teluguName: "కోడిగుడ్డు పులుసు",
      isVeg: false,
      description: "Hard-boiled eggs griddled in spices and simmered in a tangy spiced onion-tomato masala gravy.",
      price: 180,
      image: "/menu/egg_curry.png",
      prepTime: 12,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Boiled Eggs", "Spiced Onion Masala", "Tomatoes", "Curry Leaves"]
    },
    {
      name: "Chicken Korma",
      teluguName: "చికెన్ కుర్మా",
      isVeg: false,
      description: "Rich, creamy bone-in chicken curry prepared in yogurt, poppy seeds, and cashew paste base.",
      price: 290,
      image: "/menu/chicken_korma.png",
      prepTime: 18,
      category: "Non-Veg Curries",
      isFeatured: false,
      ingredients: ["Chicken Chunks", "Yogurt", "Poppy Seeds", "Cashew Paste"]
    },

    // --- BIRYANIS (10) ---
    {
      name: "Hyderabadi Dum Biryani",
      teluguName: "హైదరాబాదీ దమ్ బిర్యానీ",
      isVeg: false,
      description: "Fragrant long-grain basmati rice layered with raw marinated chicken, slow-cooked in slow dum style.",
      price: 310,
      image: "/menu/hyderabadi_dum_biryani.png",
      prepTime: 25,
      category: "Biryanis",
      isFeatured: true,
      ingredients: ["Long-grain Basmati", "Raw Chicken", "Saffron", "Mint", "Ghee"]
    },
    {
      name: "Chicken Biryani",
      teluguName: "చికెన్ బిర్యానీ",
      isVeg: false,
      description: "Aromatic basmati rice layered with pre-cooked spiced chicken, slow-cooked in low dum style.",
      price: 290,
      image: "/menu/chicken_biryani.png",
      prepTime: 22,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Cooked Spiced Chicken", "Biryani Spices", "Ghee"]
    },
    {
      name: "Mutton Biryani",
      teluguName: "మటన్ బిర్యానీ",
      isVeg: false,
      description: "Rich traditional mutton biryani layered with long-grain rice, tender goat chunks, and saffron.",
      price: 360,
      image: "/menu/mutton_biryani.png",
      prepTime: 25,
      category: "Biryanis",
      isFeatured: true,
      ingredients: ["Basmati Rice", "Tender Goat Meat", "Saffron Milk", "Aromatic Herbs"]
    },
    {
      name: "Prawns Biryani",
      teluguName: "రొయ్యల బిర్యానీ",
      isVeg: false,
      description: "Basmati rice layered with marinated spiced prawns, cooked in dum style with cardamom.",
      price: 380,
      image: "/menu/prawns_biryani.png",
      prepTime: 20,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Marinated Prawns", "Cardamom", "Biryani Spices"]
    },
    {
      name: "Fish Biryani",
      teluguName: "చేపల బిర్యానీ",
      isVeg: false,
      description: "Long-grain rice cooked in dum style with crispy deep-fried boneless fish fillets and local herbs.",
      price: 360,
      image: "/menu/fish_biryani.png",
      prepTime: 22,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Boneless Fish Fillets", "Spices", "Herbs"]
    },
    {
      name: "Egg Biryani",
      teluguName: "గుడ్డు బిర్యానీ",
      isVeg: false,
      description: "Fragrant basmati rice layered with hard-boiled eggs tossed in a spicy masala paste.",
      price: 220,
      image: "/menu/egg_biryani.png",
      prepTime: 15,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Hard-boiled Eggs", "Masala Paste", "Saffron"]
    },
    {
      name: "Paneer Biryani",
      teluguName: "పన్నీర్ బిర్యానీ",
      isVeg: true,
      description: "Aromatic basmati rice cooked in dum style with soft spiced cottage cheese cubes.",
      price: 260,
      image: "/menu/paneer_biryani.png",
      prepTime: 18,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Cottage Cheese", "Yogurt", "Biryani Masala"]
    },
    {
      name: "Veg Biryani",
      teluguName: "వెజ్ బిర్యానీ",
      isVeg: true,
      description: "Fragrant rice layered with spiced garden-fresh carrots, beans, peas, and potatoes.",
      price: 240,
      image: "/menu/veg_biryani.png",
      prepTime: 18,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Carrots", "Beans", "Peas", "Potatoes"]
    },
    {
      name: "Chicken 65 Biryani",
      teluguName: "చికెన్ 65 బిర్యానీ",
      isVeg: false,
      description: "Long-grain aromatic rice layered and served with hot, spicy, deep-fried Chicken 65 pieces.",
      price: 320,
      image: "/menu/chicken_65_biryani.png",
      prepTime: 20,
      category: "Biryanis",
      isFeatured: true,
      ingredients: ["Basmati Rice", "Chicken 65 Pieces", "Spicy Gravy", "Ghee"]
    },
    {
      name: "Ulavacharu Biryani",
      teluguName: "ఉలవచారు బిర్యానీ",
      isVeg: false,
      description: "Andhra specialty: Dum biryani cooked with horse gram soup (ulavacharu) and chicken pieces.",
      price: 320,
      image: "/menu/ulavacharu_biryani.png",
      prepTime: 24,
      category: "Biryanis",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Horse Gram Soup", "Spiced Chicken", "Cow Ghee"]
    },

    // --- RICE ITEMS (10) ---
    {
      name: "Plain Rice",
      teluguName: "సన్న బియ్యం అన్నం",
      isVeg: true,
      description: "Steamed premium aged Sona Masoori rice, served fluffy and hot.",
      price: 80,
      image: "/menu/plain_rice.png",
      prepTime: 8,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Aged Sona Masoori"]
    },
    {
      name: "Jeera Rice",
      teluguName: "జీరా రైస్",
      isVeg: true,
      description: "Premium basmati rice stir-fried with roasted cumin seeds and aromatic cow ghee.",
      price: 140,
      image: "/menu/jeera_rice.png",
      prepTime: 10,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Cumin Seeds", "Cow Ghee"]
    },
    {
      name: "Lemon Rice",
      teluguName: "నిమ్మకాయ అన్నం",
      isVeg: true,
      description: "Tangy rice preparation tempered with yellow split chickpeas, mustard, green chillies, peanuts, and fresh lemon juice.",
      price: 130,
      image: "/menu/lemon_rice.png",
      prepTime: 10,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Steamed Rice", "Lemon Juice", "Peanuts", "Yellow Split Chickpeas"]
    },
    {
      name: "Tomato Rice",
      teluguName: "టొమాటో అన్నం",
      isVeg: true,
      description: "Fragrant basmati rice cooked with fresh tomatoes, ginger, and Southern temperings.",
      price: 130,
      image: "/menu/tomato_rice.png",
      prepTime: 10,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Fresh Tomatoes", "Ginger", "Southern Spices"]
    },
    {
      name: "Coconut Rice",
      teluguName: "కొబ్బరి అన్నం",
      isVeg: true,
      description: "Aromatic steamed rice tossed with fresh grated dry-coconut, cashews, and curry leaves.",
      price: 150,
      image: "/menu/coconut_rice.png",
      prepTime: 12,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Steamed Rice", "Fresh Grated Coconut", "Cashews", "Curry Leaves"]
    },
    {
      name: "Pulihora",
      teluguName: "चिంతపండు పులిహోర",
      isVeg: true,
      description: "Traditional festive tamarind rice preparation tempered with split lentils, mustard, peanuts, and asafoetida.",
      price: 140,
      image: "/menu/pulihora.png",
      prepTime: 12,
      category: "Rice Items",
      isFeatured: true,
      ingredients: ["Steamed Rice", "Tamarind Paste", "Peanuts", "Mustard", "Asafoetida"]
    },
    {
      name: "Curd Rice",
      teluguName: "దద్దోజనం",
      isVeg: true,
      description: "Comforting steamed rice mixed with fresh curd and milk, tempered with mustard, ginger, and curry leaves.",
      price: 110,
      image: "/menu/curd_rice.png",
      prepTime: 8,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Steamed Rice", "Fresh Curd", "Ginger", "Curry Leaves"]
    },
    {
      name: "Veg Fried Rice",
      teluguName: "వెజ్ ఫ్రైడ్ రైస్",
      isVeg: true,
      description: "Stir-fried basmati rice cooked in a wok with finely chopped carrots, beans, cabbage, and soy sauce.",
      price: 160,
      image: "/menu/veg_fried_rice.png",
      prepTime: 12,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Carrots", "Beans", "Cabbage", "Soy Sauce"]
    },
    {
      name: "Egg Fried Rice",
      teluguName: "ఎగ్ ఫ్రైడ్ రైస్",
      isVeg: false,
      description: "Wok-tossed stir-fried basmati rice with scrambled eggs, white pepper, and spring onions.",
      price: 180,
      image: "/menu/egg_fried_rice.png",
      prepTime: 12,
      category: "Rice Items",
      isFeatured: false,
      ingredients: ["Basmati Rice", "Scrambled Eggs", "Spring Onions", "White Pepper"]
    },
    {
      name: "Chicken Fried Rice",
      teluguName: "చికెన్ ఫ్రైడ్ రైస్",
      isVeg: false,
      description: "Wok-tossed stir-fried basmati rice with shredded chicken chunks, eggs, and light soy sauce.",
      price: 210,
      image: "/menu/chicken_fried_rice.png",
      prepTime: 14,
      category: "Rice Items",
      isFeatured: true,
      ingredients: ["Basmati Rice", "Shredded Chicken", "Scrambled Eggs", "Soy Sauce"]
    },

    // --- TIFFINS (10) ---
    {
      name: "Idli",
      teluguName: "ఇడ్లీ",
      isVeg: true,
      description: "Soft, fluffy steamed rice cakes made from fermented rice-lentil batter, served with coconut chutney and sambar.",
      price: 80,
      image: "/menu/idli.png",
      prepTime: 5,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Rice-Lentil Batter", "Coconut Chutney", "Sambar"]
    },
    {
      name: "Ghee Karam Idli",
      teluguName: "నెయ్యి కారం ఇడ్లీ",
      isVeg: true,
      description: "Fluffy steamed idlis coated with pure cow ghee and spiced Guntur red chilli podi.",
      price: 100,
      image: "/menu/ghee_karam_idli.png",
      prepTime: 7,
      category: "Tiffins",
      isFeatured: true,
      ingredients: ["Steamed Idlis", "Cow Ghee", "Guntur Karam Podi"]
    },
    {
      name: "Dosa",
      teluguName: "దోశ",
      isVeg: true,
      description: "Crispy griddled thin crepe made of fermented rice-lentil batter, griddled with butter.",
      price: 90,
      image: "/menu/dosa.png",
      prepTime: 8,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Fermented Batter", "Butter", "Chutney"]
    },
    {
      name: "Masala Dosa",
      teluguName: "మసాలా దోశ",
      isVeg: true,
      description: "Crispy griddled crepe stuffed with a spiced potato and onion mash, served with ginger chutney.",
      price: 110,
      image: "/menu/masala_dosa.png",
      prepTime: 10,
      category: "Tiffins",
      isFeatured: true,
      ingredients: ["Fermented Dosa Batter", "Spiced Potato Mash", "Chutney", "Sambar"]
    },
    {
      name: "Pesarattu",
      teluguName: "పెసరట్టు",
      isVeg: true,
      description: "High-protein griddled crepe made of whole green gram batter, seasoned with ginger and cumin.",
      price: 110,
      image: "/menu/pesarattu.png",
      prepTime: 10,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Whole Green Gram Batter", "Ginger", "Cumin", "Onions"]
    },
    {
      name: "Upma",
      teluguName: "ఉప్మా",
      isVeg: true,
      description: "Warm semolina porridge cooked with split lentils, green chillies, ginger, and vegetables.",
      price: 70,
      image: "/menu/upma.png",
      prepTime: 7,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Semolina", "Lentils", "Ginger", "Vegetables"]
    },
    {
      name: "Poori",
      teluguName: "పూరి",
      isVeg: true,
      description: "Deep-fried puffed whole wheat flatbreads served with a spiced potato-onion curry.",
      price: 90,
      image: "/menu/poori.png",
      prepTime: 8,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Wheat Dough", "Potato Curry", "Spices"]
    },
    {
      name: "Pongal",
      teluguName: "పొంగలి",
      isVeg: true,
      description: "Creamy rice and split yellow lentil dish tempered with black pepper, cumin, ginger, and ghee.",
      price: 100,
      image: "/menu/pongal.png",
      prepTime: 8,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Steamed Rice", "Yellow Lentils", "Black Pepper", "Cow Ghee"]
    },
    {
      name: "Rava Dosa",
      teluguName: "రవ్వ దోశ",
      isVeg: true,
      description: "Crispy, lacy griddled crepe made of semolina, rice flour, green chillies, and cumin.",
      price: 110,
      image: "/menu/rava_dosa.png",
      prepTime: 10,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Semolina", "Rice Flour", "Cumin", "Green Chillies"]
    },
    {
      name: "Uttapam",
      teluguName: "ఉతప్పం",
      isVeg: true,
      description: "Thick griddled pancake made of dosa batter topped with finely chopped onions, chillies, and tomatoes.",
      price: 100,
      image: "/menu/uttapam.png",
      prepTime: 10,
      category: "Tiffins",
      isFeatured: false,
      ingredients: ["Dosa Batter", "Chopped Onions", "Tomatoes", "Green Chillies"]
    },

    // --- SNACKS (10) ---
    {
      name: "Punugulu",
      teluguName: "పునుగులు",
      isVeg: true,
      description: "Crisp, golden-brown deep-fried bondas made of fermented rice batter, served with spicy tomato chutney.",
      price: 80,
      image: "/menu/punugulu.png",
      prepTime: 6,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Rice Batter", "Onions", "Green Chutney"]
    },
    {
      name: "Mirchi Bajji",
      teluguName: "మిర్చి బజ్జి",
      isVeg: true,
      description: "Deep-fried large green chilli fritters stuffed with seasoned chopped onions, coriander, and lemon juice.",
      price: 100,
      image: "/menu/mirchi_bajji.png",
      prepTime: 12,
      category: "Snacks",
      isFeatured: true,
      ingredients: ["Banana Chillies", "Gram Flour", "Onions", "Lemon Juice"]
    },
    {
      name: "Onion Pakoda",
      teluguName: "ఉల్లిపాయ పకోడీ",
      isVeg: true,
      description: "Crispy fried fritters prepared with sliced onions, gram flour, green chillies, and curry leaves.",
      price: 90,
      image: "/menu/onion_pakoda.png",
      prepTime: 10,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Sliced Onions", "Gram Flour", "Green Chillies", "Curry Leaves"]
    },
    {
      name: "Masala Vada",
      teluguName: "మసాలా వడ",
      isVeg: true,
      description: "Crisp deep-fried patties made of coarsely ground Bengal gram, green chillies, ginger, and curry leaves.",
      price: 90,
      image: "/menu/masala_vada.png",
      prepTime: 10,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Bengal Gram", "Green Chillies", "Ginger", "Curry Leaves"]
    },
    {
      name: "Garelu",
      teluguName: "గారెలు",
      isVeg: true,
      description: "Crispy golden fried black lentil donuts served with fresh coconut chutney.",
      price: 90,
      image: "/menu/garelu.png",
      prepTime: 10,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Black Lentils", "Black Pepper", "Coconut Chutney"]
    },
    {
      name: "Samosa",
      teluguName: "సమోసా",
      isVeg: true,
      description: "Crisp flaky pastry triangles filled with a spiced green pea and potato mash.",
      price: 80,
      image: "/menu/samosa.png",
      prepTime: 10,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Wheat Pastry", "Potato Mash", "Green Peas", "Spices"]
    },
    {
      name: "Corn Cutlet",
      teluguName: "కార్న్ కట్లెట్",
      isVeg: true,
      description: "Shallow-fried patties made of sweet corn, potato, breadcrumbs, and Southern dry spices.",
      price: 110,
      image: "/menu/corn_cutlet.png",
      prepTime: 12,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Sweet Corn", "Potato Mash", "Breadcrumbs", "Spices"]
    },
    {
      name: "Veg Roll",
      teluguName: "వెజ్ రోల్",
      isVeg: true,
      description: "Griddled flatbread wrapped around stir-fried seasonal vegetables and sweet tomato sauce.",
      price: 120,
      image: "/menu/veg_roll.png",
      prepTime: 12,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Flatbread Wrapper", "Stir-fried Vegetables", "Tomato Sauce"]
    },
    {
      name: "Spring Roll",
      teluguName: "స్ప్రింగ్ రోల్",
      isVeg: true,
      description: "Crisp deep-fried wrapper rolls filled with spiced stir-fried vegetables and served with sweet chilli sauce.",
      price: 130,
      image: "/menu/spring_roll.png",
      prepTime: 12,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Spring Roll Wrappers", "Spiced Stir-fried Vegetables", "Sweet Chilli Sauce"]
    },
    {
      name: "Bread Pakoda",
      teluguName: "బ్రెడ్ పకోడీ",
      isVeg: true,
      description: "Deep-fried spiced potato sandwiches coated in a savory gram flour batter.",
      price: 100,
      image: "/menu/bread_pakoda.png",
      prepTime: 12,
      category: "Snacks",
      isFeatured: false,
      ingredients: ["Bread Slices", "Gram Flour Batter", "Potato Mash", "Dry Spices"]
    },

    // --- DESSERTS (10) ---
    {
      name: "Double Ka Meetha",
      teluguName: "డబుల్ కా మీఠా",
      isVeg: true,
      description: "Hyderabadi classic bread pudding made of ghee-fried bread slices soaked in saffron milk and dry fruits.",
      price: 140,
      image: "/menu/double_ka_meetha.png",
      prepTime: 15,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Bread Slices", "Saffron Milk", "Sugar Syrup", "Dry Fruits"]
    },
    {
      name: "Qubani Ka Meetha",
      teluguName: "ఖుబానీ కా మీఠా",
      isVeg: true,
      description: "Traditional Hyderabadi dessert made from dried apricots stewed with honey, served with fresh cream.",
      price: 150,
      image: "/menu/qubani_ka_meetha.png",
      prepTime: 15,
      category: "Desserts",
      isFeatured: true,
      ingredients: ["Dried Apricots", "Honey", "Fresh Cream", "Almond slivers"]
    },
    {
      name: "Apricot Delight",
      teluguName: "ఆప్రికాట్ డిలైట్",
      isVeg: true,
      description: "A premium dessert made of sponge cake layered with a rich stewed apricot puree and fresh whipped cream.",
      price: 160,
      image: "/menu/apricot_delight.png",
      prepTime: 15,
      category: "Desserts",
      isFeatured: true,
      ingredients: ["Sponge Cake", "Apricot Puree", "Whipped Cream"]
    },
    {
      name: "Gulab Jamun",
      teluguName: "గులాబ్ జామూన్",
      isVeg: true,
      description: "Golden fried milk-solid dumplings soaked in a hot sugar syrup flavored with green cardamom and rose water.",
      price: 110,
      image: "/menu/gulab_jamun.png",
      prepTime: 10,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Milk Solids", "Cardamom", "Rose Water", "Sugar Syrup"]
    },
    {
      name: "Rasmalai",
      teluguName: "రసమలై",
      isVeg: true,
      description: "Spongy, sweet cottage cheese discs soaked in a rich, chilled saffron milk base, garnished with pistachios.",
      price: 130,
      image: "/menu/rasmalai.png",
      prepTime: 10,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Cottage Cheese Discs", "Saffron Milk", "Pistachios"]
    },
    {
      name: "Kaju Katli",
      teluguName: "కాజు కట్లి",
      isVeg: true,
      description: "Diamond-shaped rich fudge sweets prepared with cashews, sugar syrup, and ghee.",
      price: 140,
      image: "/menu/kaju_katli.png",
      prepTime: 10,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Cashews", "Sugar Syrup", "Pure Ghee"]
    },
    {
      name: "Bobbatlu",
      teluguName: "బొబ్బట్లు",
      isVeg: true,
      description: "Sweet delicate flatbread stuffed with sweet split chickpea-jaggery cardamoms paste, griddled with desi ghee.",
      price: 130,
      image: "/menu/bobbatlu.png",
      prepTime: 12,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Bengal Gram", "Jaggery", "All-purpose Flour", "Desi Ghee"]
    },
    {
      name: "Pootharekulu",
      teluguName: "పూతరేకులు",
      isVeg: true,
      description: "Paper-thin, translucent sweet sheets made of rice starch, layered with pure ghee, sugar, and dry fruits.",
      price: 150,
      image: "/menu/pootharekulu.png",
      prepTime: 8,
      category: "Desserts",
      isFeatured: true,
      ingredients: ["Rice Starch Sheets", "Pure Ghee", "Powdered Sugar", "Dry Fruits"]
    },
    {
      name: "Payasam",
      teluguName: "పాయసం",
      isVeg: true,
      description: "Creamy traditional rice pudding cooked with fresh milk, organic jaggery, cardamom, and cashews.",
      price: 120,
      image: "/menu/payasam.png",
      prepTime: 12,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Rice", "Fresh Milk", "Organic Jaggery", "Cardamom"]
    },
    {
      name: "Semiya Kheer",
      teluguName: "సేమియా ఖీర్",
      isVeg: true,
      description: "Sweet milk pudding prepared with ghee-roasted vermicelli noodles, sugar, raisins, and cardamoms.",
      price: 120,
      image: "/menu/semiya_kheer.png",
      prepTime: 12,
      category: "Desserts",
      isFeatured: false,
      ingredients: ["Vermicelli", "Fresh Milk", "Sugar Syrup", "Cardamoms"]
    },

    // --- BEVERAGES (10) ---
    {
      name: "Irani Chai",
      teluguName: "ఇరానీ ఛాయ్",
      isVeg: true,
      description: "Hyderabadi style rich, creamy, thick slow-brewed tea, served piping hot.",
      price: 60,
      image: "/menu/irani_chai.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Brewed Tea Leaves", "Condense Milk", "Spices"]
    },
    {
      name: "Filter Coffee",
      teluguName: "ఫిల్టర్ కాఫీ",
      isVeg: true,
      description: "Strong decoction filter coffee brewed with milk and served foaming in a traditional brass tumbler.",
      price: 80,
      image: "/menu/filter_coffee.png",
      prepTime: 6,
      category: "Beverages",
      isFeatured: true,
      ingredients: ["Coffee Powder", "Milk", "Sugar"]
    },
    {
      name: "Badam Milk",
      teluguName: "బాదం పాలు",
      isVeg: true,
      description: "Sweetened chilled milk slow-brewed with almond paste, saffron threads, and cardamom.",
      price: 90,
      image: "/menu/badam_milk.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Sweetened Milk", "Almond Paste", "Saffron", "Cardamom"]
    },
    {
      name: "Rose Milk",
      teluguName: "రోజ్ మిల్క్",
      isVeg: true,
      description: "Chilled fresh milk flavored with a sweet organic rose syrup and served refreshing.",
      price: 90,
      image: "/menu/rose_milk.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Fresh Milk", "Organic Rose Syrup"]
    },
    {
      name: "Fresh Lime Soda",
      teluguName: "ఫ్రెష్ లైమ్ సోడా",
      isVeg: true,
      description: "Refreshing carbonated lemonade served sweet, salted, or mixed with fresh lime juice.",
      price: 70,
      image: "/menu/fresh_lime_soda.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Lime Juice", "Soda", "Sugar Syrup", "Mint Leaves"]
    },
    {
      name: "Mango Lassi",
      teluguName: "మ్యాంగో లస్సీ",
      isVeg: true,
      description: "Thick creamy yogurt shake blended with fresh Alphonso mango pulp and cardamom.",
      price: 110,
      image: "/menu/mango_lassi.png",
      prepTime: 6,
      category: "Beverages",
      isFeatured: true,
      ingredients: ["Thick Yogurt", "Alphonso Mango Pulp", "Cardamom"]
    },
    {
      name: "Sweet Lassi",
      teluguName: "స్వీట్ లస్సీ",
      isVeg: true,
      description: "A traditional thick, sweet churned yogurt shake garnished with fresh malai.",
      price: 90,
      image: "/menu/sweet_lassi.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Thick Yogurt", "Sugar Syrup", "Fresh Malai"]
    },
    {
      name: "Buttermilk",
      teluguName: "మజ్జిగ",
      isVeg: true,
      description: "Comforting thin yogurt beverage churned with fresh coriander, ginger, green chillies, and curry leaves.",
      price: 60,
      image: "/menu/buttermilk.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Churned Yogurt", "Coriander", "Ginger", "Curry Leaves"]
    },
    {
      name: "Watermelon Juice",
      teluguName: "పుచ్చకాయ రసం",
      isVeg: true,
      description: "Freshly pressed sweet watermelon juice served chilled with fresh mint leaf.",
      price: 90,
      image: "/menu/watermelon_juice.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Sweet Watermelon Juice", "Mint Leaf"]
    },
    {
      name: "Sugarcane Juice",
      teluguName: "చెరకు రసం",
      isVeg: true,
      description: "Freshly pressed sugarcane juice served chilled with green lime juice and ginger.",
      price: 80,
      image: "/menu/sugarcane_juice.png",
      prepTime: 5,
      category: "Beverages",
      isFeatured: false,
      ingredients: ["Sugarcane Juice", "Lime Juice", "Ginger"]
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

    for (const ingName of item.ingredients) {
      await prisma.menuItemIngredient.create({
        data: {
          menuItemId: dbItem.id,
          name: ingName,
          quantity: 100,
          unit: "grams",
          isAvailable: true,
        }
      });
    }
  }
  console.log("90 Menu items and ingredients list successfully seeded.");

  // 7. Seed Featured Reviews
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
