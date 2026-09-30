import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Page } from "./data";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { NewInvestigation } from "./pages/NewInvestigation";
import { Dashboard } from "./pages/Dashboard";
import { TimelinePage } from "./pages/TimelinePage";
import { EvidencePage } from "./pages/EvidencePage";
import { EntitiesPage } from "./pages/EntitiesPage";
import { POIPage } from "./pages/POIPage";
import { AIPage } from "./pages/AIPage";
import { Report } from "./pages/Report";
import { SettingsPage } from "./pages/Settings";
import { Graph } from "./components/Graph";

export default function App() {
  const [page, setPage] = useState<Page>(
    () => (sessionStorage.getItem("ekdanta-page") as Page) || "home"
  );
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("ekdanta-theme") as any) || "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ekdanta-theme", theme);
  }, [theme]);

  useEffect(() => {
    sessionStorage.setItem("ekdanta-page", page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const nav = (p: Page) => setPage(p);

  const renderContent = () => {
    switch (page) {
      case "home":
        return <Home navigate={nav} />;
      case "new":
        return <NewInvestigation navigate={nav} />;
      case "dashboard":
        return <Dashboard />;
      case "timeline":
        return <TimelinePage />;
      case "evidence":
        return <EvidencePage />;
      case "entities":
        return <EntitiesPage />;
      case "graph":
        return (
          <main className="page graph-page cyber-graph-view">
            <div className="workstation-header">
              <span className="technical-kicker">RELATIONAL TOPOLOGY WORKBENCH</span>
              <h1>CONNECTION GRAPH</h1>
              <p>
                Interactive network graph of all 400 forensic nodes and 1,000 relationships. 
                Click any key entity to focus the camera and open deep forensic metadata.
              </p>
            </div>
            <div className="fullscreen-graph-container">
              <Graph />
            </div>
          </main>
        );
      case "poi":
        return <POIPage />;
      case "ai":
        return <AIPage />;
      case "report":
        return <Report />;
      case "settings":
        return (
          <SettingsPage
            theme={theme}
            onToggleTheme={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
          />
        );
      default:
        return <Home navigate={nav} />;
    }
  };

  return (
    <div className="app cyber-os-root">
      {/* Background Architectural Grid & Particle Glow */}
      <div className="cyber-ambient-grid" />
      <div className="cyber-ambient-radial" />

      {/* Global Header */}
      <Topbar
        theme={theme}
        activePage={page}
        onToggle={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
        onNavigate={nav}
      />

      {/* Sidebar for all internal case workspaces */}
      {page !== "home" && <Sidebar active={page} onNavigate={nav} />}

      {/* Main Page Area with Section 34 Page Transition (150-250ms) */}
      <div className={page === "home" ? "content full" : "content"}>
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="page-transition-wrapper"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
