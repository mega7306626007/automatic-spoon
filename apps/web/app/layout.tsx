import "./globals.css";
export const metadata = { title: "AdForge", description: "Local-first advertising studio", manifest: "/manifest.webmanifest" };
export const viewport = { themeColor: "#0B1026" };
export default function Root({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
