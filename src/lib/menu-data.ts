export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: "Starters" | "Main Course" | "Desserts";
}

export const menuItems: MenuItem[] = [
  {
    id: "s1",
    name: "Seared Diver Scallops",
    description: "Pan-seared diver scallops, parsnip purée, caramelized pear, and hazelnut brown butter drizzle.",
    price: "$28",
    category: "Starters",
  },
  {
    id: "s2",
    name: "Heirloom Beet Salad",
    description: "Roasted organic baby beets, whipped goat cheese, wild honeycomb, toasted pistachio, and balsamic reduction.",
    price: "$22",
    category: "Starters",
  },
  {
    id: "m1",
    name: "Truffle Glazed Wagyu Beef",
    description: "A5 Miyazaki Wagyu, black truffle demi-glace, roasted chanterelles, and silken potato mousseline.",
    price: "$85",
    category: "Main Course",
  },
  {
    id: "m2",
    name: "Chilean Sea Bass",
    description: "Miso-glazed sea bass, baby bok choy, wild mushrooms, and ginger-infused lemongrass dashi broth.",
    price: "$56",
    category: "Main Course",
  },
  {
    id: "m3",
    name: "Heritage Duck Breast",
    description: "Spice-crusted roasted duck breast, spiced plum compote, sweet potato fondant, and orange grand marnier reduction.",
    price: "$48",
    category: "Main Course",
  },
  {
    id: "d1",
    name: "Valrhona Chocolate Soufflé",
    description: "Warm dark chocolate soufflé, Tahitian vanilla bean crème anglaise, and gold leaf dust.",
    price: "$18",
    category: "Desserts",
  },
  {
    id: "d2",
    name: "Meyer Lemon Tart",
    description: "Crisp pastry shell, Meyer lemon curd, toasted Italian meringue, and raspberry coulis.",
    price: "$16",
    category: "Desserts",
  },
  {
    id: "d3",
    name: "Grand Marnier Crème Brûlée",
    description: "Velvety orange-liqueur custard, brittle caramelized sugar crust, and fresh seasonal berries.",
    price: "$17",
    category: "Desserts",
  },
];
