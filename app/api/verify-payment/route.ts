import { liveStoreReady } from "../../../lib/store";
export const dynamic = "force-static";
export async function POST(){return Response.json({status:liveStoreReady()?"UNCONFIGURED_PERSISTENCE":"STORE_DISABLED"},{status:503});}
