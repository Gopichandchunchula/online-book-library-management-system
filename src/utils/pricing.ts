import { Book } from "../types";

/**
 * Returns a custom deterministic price in Indian Rupees (₹) for a given book title.
 * Assures specified user examples match exactly and others are in the ₹199 - ₹599 range.
 */
export const getBookPrice = (title: string): number => {
  const normalized = title.toLowerCase();
  
  // User specific example pricing rules
  if (normalized.includes("introduction to algorithms")) {
    return 450;
  }
  if (normalized.includes("dune")) {
    return 399;
  }
  if (normalized.includes("clean code")) {
    return 299;
  }
  if (normalized.includes("sapiens")) {
    return 349;
  }
  if (normalized.includes("python programming masterclass") || normalized.includes("python mastery")) {
    return 279;
  }
  if (normalized.includes("python for beginners")) {
    return 199;
  }
  if (normalized.includes("advanced python")) {
    return 325;
  }
  if (normalized.includes("automate the boring stuff")) {
    return 289;
  }

  // General deterministic range between ₹199 to ₹599
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 199;
  const max = 599;
  const price = min + (Math.abs(hash) % (max - min + 1));
  
  // Make it look like a retail price ending in 9 or 5
  const base = Math.floor(price / 10) * 10;
  return base + (base % 20 === 0 ? 9 : 5);
};
