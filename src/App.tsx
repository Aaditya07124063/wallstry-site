import { useEffect, useState } from "react";
import { Demo } from "./Demo";
import { Research } from "./Research";
import { About, Landing } from "./Pages";
import { Architecture } from "./Architecture";
import { Engineering } from "./Engineering";

const PAGES = [["home", "Overview"], ["demo", "Trading"], ["research", "Research"], ["architecture", "Architecture"], ["engineering", "Engineering"], ["about", "Limits & credit"]] as const;
const fromHash = () => { const h = location.hash.slice(1); return PAGES.some(([k]) => k === h) ? h : "home"; };

// Text tables become stacked cards on phones (see styles.css); each cell is labelled from its column header.
function labelCells(root: ParentNode) {
  root.querySelectorAll("table.txt, table.cards").forEach((t) => {
    const heads = [...t.querySelectorAll("thead th")].map((h) => h.textContent ?? "");
    t.querySelectorAll("tbody tr").forEach((tr) => [...tr.children].forEach((c, i) => {
      if (c.tagName === "TD" && heads[i] && c.getAttribute("data-label") !== heads[i]) c.setAttribute("data-label", heads[i]);
    }));
  });
}

export default function App() {
  const [page, setPage] = useState(fromHash);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const main = document.getElementById("main")!;
    labelCells(main);
    const o = new MutationObserver(() => labelCells(main));
    o.observe(main, { childList: true, subtree: true });
    return () => o.disconnect();
  }, []);
  useEffect(() => { setMenu(false); }, [page]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  useEffect(() => { const f = () => setPage(fromHash()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  useEffect(() => { document.title = `${PAGES.find(([k]) => k === page)![1]} - Wallstry`; window.scrollTo(0, 0); }, [page]);
  const go = (p: string) => { location.hash = p; };
  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to content</a>
      <header className="top">
        <strong className="brand">Wall<i>stry</i></strong>
        <button type="button" className="menu-btn" aria-expanded={menu} aria-controls="site-nav" onClick={() => setMenu((m) => !m)}>
          <span aria-hidden="true" className="burger" /><span aria-hidden="true">{menu ? "Close" : "Menu"}</span><span className="sr">Menu</span>
        </button>
        <nav id="site-nav" aria-label="Main" className={menu ? "open" : undefined}>
          {PAGES.map(([k, label]) => <a key={k} href={`#${k}`} aria-current={page === k ? "page" : undefined}>{label}</a>)}
        </nav>
      <span className="pill" title="All prices, books and fills on this site are generated in your browser">SIMULATED · NOT LIVE</span>
      </header>
      <main id="main" tabIndex={-1} className={page === "demo" ? "wide" : undefined}>
        {page === "home" && <Landing go={go} />}
        {page === "demo" && <><h1 className="pagetitle">Trading workspace</h1><Demo /></>}
        {page === "research" && <><h1 className="pagetitle">Research</h1><Research /></>}
        {page === "architecture" && <><h1 className="pagetitle">Architecture</h1><Architecture /></>}
        {page === "engineering" && <><h1 className="pagetitle">Engineering</h1><Engineering /></>}
        {page === "about" && <><h1 className="pagetitle">Limitations, licensing and credit</h1><About /></>}
      </main>
      <footer>Simulated and derived data only. Not investment advice. Paper trading; no real money.</footer>
    </>
  );
}
