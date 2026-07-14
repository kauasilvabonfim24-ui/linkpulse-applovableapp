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
          .select("id, url")
          .eq("short", code)
          .single();

        if (fetchError || !linkData) {
          setError("Link not found");
          setLoading(false);
          return;
        }

        const linkId = linkData.id as string;
        const targetUrl = linkData.url as string;

        // Register the click (awaited → triggers Realtime for the dashboard).
        await supabase.from("click_events").insert({
          link_id: linkId,
          clicked_at: new Date().toISOString(),
          referrer: document.referrer || "Direto",
        });

        // Fire push notification without blocking the redirect.
        // Edge function computes counts server-side (faster, single round-trip).
        // keepalive lets the request finish after navigation starts.
        try {
          const url = `${(supabase as any).supabaseUrl}/functions/v1/notify-click`;
          const anonKey = (supabase as any).supabaseKey;
          fetch(url, {
            method: "POST",
            keepalive: true,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${anonKey}`,
              "apikey": anonKey,
            },
            body: JSON.stringify({ linkId }),
          }).catch(() => {});
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
