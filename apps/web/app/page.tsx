"use client";
import { useEffect, useState } from "react";
import type { Category } from "@adforge/template-library";
import { useStudio } from "../lib/useStudio";
import { Editor } from "../components/Editor";
import { Home, Templates, Projects, type Fmt } from "../components/Library";
import { BrandKits, AiStudio, SettingsView } from "../components/Tools";
import { defaultSettings, loadKits, loadSettings, type Settings } from "../lib/store";
import type { BrandKit } from "../lib/brand";

const NAV: [string, string][] = [["home", "Home"], ["create", "Editor"], ["templates", "Designs"], ["projects", "Projects"], ["brands", "Brand kits"], ["ai", "AI Studio"], ["settings", "Settings"]];
export default function Shell() {
  const s = useStudio(); const [view, setView] = useState("home"), [cat, setCat] = useState<Category | undefined>(), [fmt, setFmt] = useState<Fmt | undefined>(), [kits, setKits] = useState<BrandKit[]>([]), [settings, setSettings] = useState<Settings>(defaultSettings);
  useEffect(() => { loadKits().then(setKits).catch(() => {}); loadSettings().then(setSettings).catch(() => {}); }, []);
  useEffect(() => { if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);
  const go = (v: string, c?: Category, f?: Fmt) => { setCat(c); setFmt(f); setView(v); };
  return <div className="shell"><nav className="nav" aria-label="Main"><div className="brand">ADFORGE</div>{NAV.map(([k, l]) => <button key={k} className={view === k ? "on" : ""} onClick={() => go(k)}>{l}</button>)}</nav>
    <main className="main">{view === "home" && <Home s={s} go={go} kits={kits} online={settings.onlineEnabled} />}{view === "create" && <Editor s={s} />}{view === "templates" && <Templates s={s} go={go} kits={kits} initialCat={cat} initialFmt={fmt} />}
      {view === "projects" && <Projects s={s} go={go} />}{view === "brands" && <BrandKits kits={kits} setKits={setKits} s={s} go={go} />}{view === "ai" && <AiStudio s={s} kits={kits} settings={settings} go={go} />}{view === "settings" && <SettingsView settings={settings} setSettings={setSettings} />}</main></div>;
}
