import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/r/$code")({
  head: () => ({
    meta: [{ title: "Redirecionando..." }],
  }),
  component: RedirectPage,
});

interface LinkData {
  id: string;
  url: string;
}

function RedirectPage() {
  const { code } = useParams({ from: "/r/$code" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      try {
        const { data: linkData, error: fetchError } = await supabase
          .from("links")
          .select("id, url, name, commission")
          .eq("short", code)
          .single();

        if (fetchError || !linkData) {
          setError("Link not found");
          setLoading(false);
          return;
        }

        const linkId = linkData.id as string;
        const targetUrl = linkData.url as string;

        await supabase.from("click_events").insert({
          link_id: linkId,
          clicked_at: new Date().toISOString(),
          referrer: document.referrer || "Direto",
        });

        // Dispara notificação push (mesma lógica anterior ao /r/:code)
        try {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const [{ count: todayClicks }, { count: totalClicks }] = await Promise.all([
            supabase
              .from("click_events")
              .select("*", { count: "exact", head: true })
              .eq("link_id", linkId)
              .gte("clicked_at", startOfDay.toISOString()),
            supabase
              .from("click_events")
              .select("*", { count: "exact", head: true })
              .eq("link_id", linkId),
          ]);
          await supabase.functions.invoke("notify-click", {
            body: {
              linkName: (linkData as any).name ?? "Link",
              commission: (linkData as any).commission ?? 0,
              todayClicks: todayClicks ?? 0,
              totalClicks: totalClicks ?? 0,
            },
          });
        } catch (notifyErr) {
          console.error("notify-click error:", notifyErr);
        }

        window.location.replace(targetUrl);
      } catch (err) {
        console.error("Redirect error:", err);
        setError("An error occurred");
        setLoading(false);
      }
    };

    redirect();
  }, [code]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#060B14", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Link não encontrado</h1>
          <p style={{ fontSize: "16px", color: "#94A3B8" }}>Este link pode ter expirado ou não existe.</p>
          <a href="/" style={{ display: "inline-block", marginTop: "24px", padding: "12px 24px", background: "#0EA5E9", color: "#FFF", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
            Voltar para LinkPulse
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060B14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#FFF" }}>
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>⏳</div>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>Redirecionando...</h1>
        <p style={{ fontSize: "16px", color: "#94A3B8" }}>Você será redirecionado em breve.</p>
      </div>
    </div>
  );
}
