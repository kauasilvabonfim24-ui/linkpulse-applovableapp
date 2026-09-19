import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinkPulse — seus links de afiliado, rastreados em tempo real" },
      { name: "description", content: "Encurte seus links de afiliado, divulgue nos grupos e acompanhe cada clique em tempo real." },
      { property: "og:title", content: "LinkPulse — seus links de afiliado, rastreados em tempo real" },
      { property: "og:description", content: "Encurte seus links de afiliado, divulgue nos grupos e acompanhe cada clique em tempo real." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [Landing, setLanding] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Se a pessoa chegou por um link de indicação (?ref=CODIGO), guarda
    // pra usar depois do cadastro — o link de indicação sempre cai na
    // landing (rota /), nunca direto em /app.
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem("linkpulse_ref", ref);

    let mounted = true;
    import("../components/Landing").then((mod) => {
      if (mounted) setLanding(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Landing) {
    return <div style={{ minHeight: "100vh", background: "#060B14" }} />;
  }
  return <Landing />;
}
