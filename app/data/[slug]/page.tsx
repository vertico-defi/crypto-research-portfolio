import { products } from "../../../lib/snapshot";
export function generateStaticParams(){return products().map(product=>({slug:product.product_id}));}
export default function Page({params}:{params:{slug:string}}){const p=products().find(x=>x.product_id===params.slug);return <><h1>{p?.title ?? "Unknown product"}</h1><p>{p?.risk_disclaimer}</p><button disabled>Checkout unavailable</button><p>Live checkout is disabled until merchant, legal, rights, storage, and verification gates pass.</p></>}
