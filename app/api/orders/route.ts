import { createDisabledOrder, liveStoreReady } from "../../../lib/store";
export const dynamic = "force-static";
export async function POST(request:Request){const body=await request.json() as {productId?:string};if(!body.productId)return Response.json({error:"productId required"},{status:400});if(!liveStoreReady())return Response.json(createDisabledOrder(body.productId),{status:503});return Response.json({error:"Live order persistence is not configured"},{status:503});}
