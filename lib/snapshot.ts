import fs from "node:fs";
import path from "node:path";
import type { Product, Strategy } from "./types";
const root = path.join(process.cwd(), "public", "data");
export function readJson<T>(name: string): T { return JSON.parse(fs.readFileSync(path.join(root, name), "utf8")) as T; }
export function strategies(): Strategy[] { return readJson<{ strategies: Strategy[] }>("strategy-snapshot.json").strategies; }
export function products(): Product[] { return readJson<{ products: Product[] }>("product-catalog-public.json").products; }
