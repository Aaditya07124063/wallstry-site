import { useEffect, useState } from "react";
import { Demo } from "./Demo";
import { Research } from "./Research";
import { About, Architecture, Engineering, Landing } from "./Pages";

const PAGES = [["home", "Overview"], ["demo", "Try Demo"], ["research", "Research"], ["architecture", "Architecture"], ["engineering", "Engineering"], ["about", "Limits & credit"]] as const;
const fromHash = () => { const h = location.hash.slice(1); return PAGES.some(([k]) => k === h) ? h : "home"; };

export default function App() {
  const [page, setPage] = useState(fromHash);
  useEffect(() => { const f = () => setPage(fromHash()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  useEffect(() => { document.title = `${PAGES.find(([k]) => k === page)![1]} - Wallstry`; window.scrollTo(0, 0); }, [page]);
  const go = (p: string) => { location.hash = p; };
  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to content</a>
      <header className="top">
        <strong className="brand">Wallstry case study</strong>
        <nav aria-label="Main">
          {PAGES.map(([k, label]) => <a key={k} href={`#${k}`} aria-current={page === k ? "page" : undefined} className={k === "demo" ? "cta" : undefined}>{label}</a>)}
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {page === "home" && <Landing go={go} />}
        {page === "demo" && <><h1 className="pagetitle">Try the demo</h1><Demo /></>}
        {page === "research" && <><h1 className="pagetitle">Research results</h1><Research /></>}
        {page === "architecture" && <><h1 className="pagetitle">Architecture</h1><Architecture /></>}
        {page === "engineering" && <><h1 className="pagetitle">Engineering and tests</h1><Engineering /></>}
        {page === "about" && <><h1 className="pagetitle">Limitations and credit</h1><About /></>}
      </main>
      <footer>Simulated and derived data only. Not investment advice. Paper trading; no real money.</footer>
    </>
  );
}
