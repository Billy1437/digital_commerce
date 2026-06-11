import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }),
});

// Prices are placeholders in MMK — adjust to your real rates before launch.
const catalog = [
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    sortOrder: 0,
    products: [
      { name: "86 Diamonds", price: 5_500 },
      { name: "172 Diamonds", price: 11_000 },
      { name: "257 Diamonds", price: 16_500 },
      { name: "343 Diamonds", price: 22_000 },
      { name: "514 Diamonds", price: 32_500 },
      { name: "706 Diamonds", price: 44_000 },
      { name: "1028 Diamonds", price: 64_000 },
      { name: "2195 Diamonds", price: 135_000 },
      { name: "Weekly Diamond Pass", price: 6_500 },
      { name: "Twilight Pass", price: 33_000 },
    ],
    listings: [
      {
        title: "Mythic Glory account — 120 skins, all emblems maxed",
        description:
          "Full-access Mythic Glory account. Original email included, no bind issues. 110 heroes, 120 skins including 3 Legend skins.",
        rank: "Mythic Glory",
        level: 33,
        price: 850_000,
        specs: {
          heroes: 110,
          skins: 120,
          legendSkins: 3,
          emblems: "All maxed",
          winRate: "58%",
        },
      },
      {
        title: "Mythic account — 75 skins, clean history",
        description:
          "Mythic rank this season. 95 heroes, 75 skins. Email changeable on delivery.",
        rank: "Mythic",
        level: 31,
        price: 380_000,
        specs: { heroes: 95, skins: 75, emblems: "Most maxed" },
      },
    ],
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    sortOrder: 1,
    products: [
      { name: "60 UC", price: 6_500 },
      { name: "325 UC", price: 31_000 },
      { name: "660 UC", price: 62_000 },
      { name: "1800 UC", price: 165_000 },
      { name: "3850 UC", price: 330_000 },
      { name: "8100 UC", price: 650_000 },
    ],
    listings: [
      {
        title: "Conqueror account — Glacier M416, 40+ outfits",
        description:
          "Conqueror in Squad TPP. Glacier M416 maxed, Pharaoh X-Suit. Facebook unbindable, Twitter login provided.",
        rank: "Conqueror",
        level: 72,
        price: 1_200_000,
        specs: {
          tier: "Conqueror",
          gunSkins: 25,
          outfits: 43,
          xSuits: 1,
          rp: "Elite Pass x12",
        },
      },
    ],
  },
];

async function main() {
  for (const game of catalog) {
    const { products, listings, ...gameData } = game;

    const dbGame = await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: { name: gameData.name, sortOrder: gameData.sortOrder },
      create: gameData,
    });

    for (const [index, product] of products.entries()) {
      const existing = await prisma.topupProduct.findFirst({
        where: { gameId: dbGame.id, name: product.name },
      });
      if (existing) {
        await prisma.topupProduct.update({
          where: { id: existing.id },
          data: { price: product.price, sortOrder: index },
        });
      } else {
        await prisma.topupProduct.create({
          data: { ...product, gameId: dbGame.id, sortOrder: index },
        });
      }
    }

    for (const listing of listings) {
      const existing = await prisma.accountListing.findFirst({
        where: { gameId: dbGame.id, title: listing.title },
      });
      if (!existing) {
        await prisma.accountListing.create({
          data: { ...listing, gameId: dbGame.id },
        });
      }
    }
  }

  const counts = {
    games: await prisma.game.count(),
    topupProducts: await prisma.topupProduct.count(),
    accountListings: await prisma.accountListing.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
