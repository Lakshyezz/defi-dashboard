import type { CategoryType } from "../types/dashboard";

export const TARGET_POOL_IDS = [
  "db678df9-3281-4bc2-a8bb-01160ffd6d48", // aave-v3
  "c1ca08e4-d618-415e-ad63-fcec58705469", // compound-v3
  "8edfdf02-cdbb-43f7-bca6-954e5fe56813", // maple
  "747c1d2a-c668-4682-b9f9-296708a3dd90", // lido
  "80b8bf92-b953-4c20-98ea-c9653ef2bb98", // binance-staked-eth
  "90bfb3c2-5d35-4959-a275-ba5085b08aa3", // stader
  "107fb915-ab29-475b-b526-d0ed0d3e6110", // cian-yield-layer
  "05a3d186-2d42-4e21-b1f0-68c079d22677", // yearn-finance
  "1977885c-d5ae-4c9e-b4df-863b7e1578e6", // beefy
] as const;

export const CATEGORY_MAPPING: Record<string, CategoryType> = {
  "db678df9-3281-4bc2-a8bb-01160ffd6d48": "Lending",
  "c1ca08e4-d618-415e-ad63-fcec58705469": "Lending",
  "8edfdf02-cdbb-43f7-bca6-954e5fe56813": "Lending",
  "747c1d2a-c668-4682-b9f9-296708a3dd90": "Liquid Staking",
  "80b8bf92-b953-4c20-98ea-c9653ef2bb98": "Liquid Staking",
  "90bfb3c2-5d35-4959-a275-ba5085b08aa3": "Liquid Staking",
  "107fb915-ab29-475b-b526-d0ed0d3e6110": "Yield Aggregator",
  "05a3d186-2d42-4e21-b1f0-68c079d22677": "Yield Aggregator",
  "1977885c-d5ae-4c9e-b4df-863b7e1578e6": "Yield Aggregator",
};

export const CATEGORIES: CategoryType[] = [
  "All",
  "Lending",
  "Liquid Staking",
  "Yield Aggregator",
];