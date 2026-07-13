import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../linkpulse.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinkPulse — Rastreador de Links" },
      { name: "description", content: "Acompanhe cliques e desempenho dos seus links de afiliado em tempo real." },
      { property: "og:title", content: "LinkPulse — Rastreador de Links" },
      { property: "og:description", content: "Acompanhe cliques e desempenho dos seus links de afiliado em tempo real." },
    ],
  }),
  component: Index,
});

function Index() {
  const [App, setApp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;
    import("../App").then((mod) => {
      if (mounted) setApp(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!App) {
    return <div style={{ minHeight: "100vh", background: "#060B14" }} />;
  }
  return <App />;
}
