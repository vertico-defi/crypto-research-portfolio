import "./styles.css";
import Link from "next/link";
export const metadata = { title: "Vertico Research", description: "Frozen-protocol crypto research systems and evidence audits." };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body><header><Link className="brand" href="/">Vertico Research</Link><nav aria-label="Primary"><Link href="/strategies">Research</Link><Link href="/compare">Compare</Link><Link href="/data">Data</Link><Link href="/methodology">Methodology</Link><Link href="/github">GitHub</Link></nav></header><main>{children}</main><footer>Research only. No capital is permitted for any listed system.</footer></body></html>; }
