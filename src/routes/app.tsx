import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../linkpulse.css";

export const Route = createFileRoute("/app")({
  validateSearch: (search: Record<string, unknown>) => ({
    signup: search.signup === true || search.signup === "true",
  }),
  head: () => ({
    meta: [
      { title: "LinkPulse — Painel" },
      { name: "description", content: "Acompanhe cliques e desempenho dos seus links de afiliado em tempo real." },
    ],
  }),
  component: AppRoute,
});

function AppRoute() {
  const { signup } = Route.useSearch();
  const [App, setApp] = useState<React.ComponentType<{ initialMode?: "login" | "signup" }> | null>(null);

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
  return <App initialMode={signup ? "signup" : "login"} />;
}
