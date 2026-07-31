import { liveStoreReady } from "../../../lib/store";
export async function POST(){return Response.json({status:liveStoreReady()?"UNCONFIGURED_PERSISTENCE":"STORE_DISABLED"},{status:503});}
