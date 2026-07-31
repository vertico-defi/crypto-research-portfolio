import crypto from "node:crypto";
const required = ["SOLANA_RPC_URL","SOLANA_MERCHANT_WALLET","SOLANA_USDC_MINT","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_PRIVATE_BUCKET"] as const;
export function liveStoreReady(){return process.env.STORE_LIVE === "true" && required.every(key=>Boolean(process.env[key]));}
export function createDisabledOrder(productId:string){return {orderId:crypto.randomUUID(),productId,status:"STORE_DISABLED",reason:"Live merchant, legal, rights, private-storage, and payment-verification gates are not complete."};}
export function solanaPayUrl(recipient:string, amount:string, reference:string, label:string){return `solana:${recipient}?amount=${encodeURIComponent(amount)}&spl-token=${encodeURIComponent(process.env.SOLANA_USDC_MINT ?? "")}&reference=${encodeURIComponent(reference)}&label=${encodeURIComponent(label)}`;}
