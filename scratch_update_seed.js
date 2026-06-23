const fs = require("fs");
const path = require("path");

const seedPath = path.join(__dirname, "prisma", "seed.ts");
if (!fs.existsSync(seedPath)) {
  console.error("seed.ts not found!");
  process.exit(1);
}

let seedContent = fs.readFileSync(seedPath, "utf-8");

const replacements = {
  '"/menu/chicken65.jpg"': '"https://images.unsplash.com/photo-1610057099443-fde8c4d90e8b?q=80&w=600&auto=format&fit=crop"',
  '"/menu/apollo_fish.jpg"': '"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop"',
  '"/menu/paneer_tikka.jpg"': '"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=600&auto=format&fit=crop"',
  '"/menu/paneer_butter.jpg"': '"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop"',
  '"/menu/gongura_mutton.jpg"': '"https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"',
  '"/menu/natu_kodi.jpg"': '"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=600&auto=format&fit=crop"',
  '"/menu/royyala_vepudu.jpg"': '"https://images.unsplash.com/photo-1559737607-9878a634f697?q=80&w=600&auto=format&fit=crop"',
  '"/menu/guntur_biryani.jpg"': '"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop"',
  '"/menu/ulavacharu_biryani.jpg"': '"https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"',
  '"/menu/mutton_biryani.jpg"': '"https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"',
  '"/menu/prawns_biryani.jpg"': '"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop"',
  '"/menu/steamed_rice.jpg"': '"https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=600&auto=format&fit=crop"',
  '"/menu/curd_rice.jpg"': '"https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=600&auto=format&fit=crop"',
  '"/menu/pesarattu.jpg"': '"https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"',
  '"/menu/idli.jpg"': '"https://images.unsplash.com/photo-1589302168068-9646c49d4d67?q=80&w=600&auto=format&fit=crop"',
  '"/menu/ghee_dosa.jpg"': '"https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"',
  '"/menu/upma.jpg"': '"https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"',
  '"/menu/punugulu.jpg"': '"https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"',
  '"/menu/mirchi_bajji.jpg"': '"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop"',
  '"/menu/bobbatlu.jpg"': '"https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"',
  '"/menu/double_ka_meetha.jpg"': '"https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"',
  '"/menu/gulab_jamun.jpg"': '"https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"',
  '"/menu/filter_coffee.jpg"': '"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"',
  '"/menu/badam_milk.jpg"': '"https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600&auto=format&fit=crop"',
  '"/menu/fresh_lime.jpg"': '"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"'
};

let replacedCount = 0;
for (const [target, replacement] of Object.entries(replacements)) {
  if (seedContent.includes(target)) {
    seedContent = seedContent.replace(target, replacement);
    replacedCount++;
  }
}

fs.writeFileSync(seedPath, seedContent, "utf-8");
console.log(`Successfully updated ${replacedCount} image paths in seed.ts`);
