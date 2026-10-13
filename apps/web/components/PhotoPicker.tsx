"use client";
import { useEffect, useState } from "react";
import { entryToPhoto, loadManifest, type Manifest } from "../lib/library";
import { searchPexels, type StockPhoto } from "../lib/photos";
import { photoToData, type FoundPhoto } from "../lib/photoflow";
import type { Settings } from "../lib/store";
/** Pick a real photo from the local library (offline) or from Pexels (online, only after you confirm each search). */
export function PhotoPicker({ settings, onPick, onClose }: { settings: Settings; onPick: (f: FoundPhoto) => void; onClose: () => void }) {
  const [lib, setLib] = useState<Manifest | null | undefined>(undefined), [q, setQ] = useState(""), [online, setOnline] = useState<StockPhoto[]>([]), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { loadManifest().then(setLib).catch(() => setLib(null)); }, []);
  const canSearch = settings.photosEnabled && settings.pexelsKey.trim().length > 0;
  const search = async () => { if (!q.trim()) { setMsg("Type what kind of photo you want, e.g. “bakery bread”."); return; }
    if (!confirm(`Search Pexels for “${q.trim()}”?\nYour search words and API key are sent to api.pexels.com. Your designs and images are not uploaded.`)) return;
    setBusy(true); setMsg("Searching…"); try { const r = await searchPexels(q, settings.pexelsKey, { perPage: 18 }); setOnline(r); setMsg(r.length ? "" : "No photos found. Try other words."); } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); } };
  const choose = async (p: StockPhoto) => { setBusy(true); setMsg("Downloading photo…"); try { onPick(await photoToData(p)); } catch (e) { setMsg("Could not use that photo: " + (e as Error).message); setBusy(false); } };
  const mine = (lib?.photos ?? []).filter(e => !q.trim() || `${e.category} ${e.alt}`.toLowerCase().includes(q.trim().toLowerCase())).map(entryToPhoto);
  const grid = (list: StockPhoto[]) => <div className="photos">{list.map(p => <button key={p.source + p.id} className="ph" disabled={busy} onClick={() => choose(p)} title={`${p.alt || "Photo"} · ${p.author}`}><img src={p.thumb} alt={p.alt || "Photo"} loading="lazy" /><span>{p.author}</span></button>)}</div>;
  return <div className="modal" role="dialog" aria-label="Stock photos" onClick={onClose}><div className="modalBox" onClick={e => e.stopPropagation()}>
    <div className="row" style={{ justifyContent: "space-between" }}><b>Real photos</b><button className="btn" onClick={onClose}>Close</button></div>
    <div className="row" style={{ margin: "10px 0" }}><input className="input" style={{ flex: 1 }} placeholder="Search words (library: filter; Pexels: search)" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && canSearch && search()} />
      <button className="btn primary" disabled={!canSearch || busy} title={canSearch ? "" : "Turn on photo search in Settings first"} onClick={search}>Search Pexels</button></div>
    {msg && <div className="muted">{msg}</div>}
    <h2 style={{ marginTop: 6 }}>Your photo library{lib ? ` (${mine.length})` : ""}</h2>
    {lib === undefined ? <div className="muted">Loading…</div> : mine.length ? grid(mine) : <div className="muted">{lib ? "Nothing matches that search." : <>No offline library yet. Run <code>PEXELS_API_KEY=your_key npm run photos -w @adforge/web</code> once to download real photos to this computer.</>}</div>}
    {online.length > 0 && <><h2>Pexels results</h2>{grid(online)}<div className="muted" style={{ marginTop: 8 }}>Photos provided by Pexels. Photographer credit is saved with your design.</div></>}
  </div></div>;
}
