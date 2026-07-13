import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { BackgroundMusic } from "@/components/BackgroundMusic.tsx";
import { ThemeToggle } from "@/components/ThemeToggle.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import HackodevNebula from "./pages/HackodevNebula.tsx";
import GalaxyView from "./pages/GalaxyView.tsx";
import SocIntro from "./pages/SocIntro.tsx";
import SocDomain from "./pages/SocDomain.tsx";
import RedTeamGalaxy from "./pages/RedTeamGalaxy.tsx";
import RedTeamDomain from "./pages/RedTeamDomain.tsx";
import CloudNebula from "./pages/CloudNebula.tsx";
import ThreatIntelCluster from "./pages/ThreatIntelCluster.tsx";
import UniverseDomain from "./pages/UniverseDomain.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/" />} /> {/* TODO: change redirect after auth to correct page */}
            <Route path="/nebula" element={<HackodevNebula />} />
            <Route path="/nebula/blue-team" element={<GalaxyView />} />
            <Route path="/nebula/red-team" element={<RedTeamGalaxy />} />
            <Route path="/nebula/cloud" element={<CloudNebula />} />
            <Route path="/nebula/threat-intel" element={<ThreatIntelCluster />} />
            <Route path="/soc" element={<SocIntro />} />
            <Route path="/soc/:domain" element={<SocDomain />} />
            <Route path="/red-team/:domain" element={<RedTeamDomain />} />
            <Route path="/cloud/:domain" element={<UniverseDomain />} />
            <Route path="/threat-intel/:domain" element={<UniverseDomain />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ThemeToggle />
        </BrowserRouter>
        <Toaster />
        <BackgroundMusic />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);
