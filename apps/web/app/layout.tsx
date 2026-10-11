export const metadata = { title: "AdForge", description: "Local-first AI advertising studio" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{ margin: 0, background: "#0B1026", color: "#E5E7EB", fontFamily: "Inter, system-ui, Arial, sans-serif" }}>{children}</body></html>;
}
