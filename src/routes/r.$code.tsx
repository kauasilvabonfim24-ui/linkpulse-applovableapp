import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  "https://dsgxkhpeomdadzfkfadu.supabase.co",
  "sb_publishable_BdTgJVPErF9ta0z5vZZLLQ_V5nuSAqM",
);

const resolveAndRegisterClick = createServerFn({ method: "GET" })
  .validator((code: unknown) => {
    if (typeof code !== "string" || !code) {
      throw new Error("Invalid code");
    }
    return code;
  })
  .handler(async ({ data: code }) => {
    const { data: linkData, error } = await supabaseServer
      .from("links")
      .select("id, url, clicks, active")
      .eq("short", code)
      .single();

    if (error || !linkData) {
      return { url: null as string | null };
    }

    const linkId = linkData.id as string;
    const targetUrl = linkData.url as string;
    const currentClicks = Number((linkData as any).clicks || 0);
    const isActive = (linkData as any).active !== false;

    // Link excluído no app (soft delete): continua redirecionando pro
    // destino normalmente, mas não grava clique nem dispara notificação —
    // isso é reservado só para links que ainda estão salvos/ativos no app.
    if (!isActive) {
      return { url: targetUrl };
    }

    // Registra o clique e incrementa o contador em paralelo, no servidor,
    // sem depender de JavaScript no navegador da pessoa que clicou.
    await Promise.all([
      supabaseServer.from("click_events").insert({
        link_id: linkId,
        clicked_at: new Date().toISOString(),
        referrer: "Servidor",
      }),
      supabaseServer.from("links").update({ clicks: currentClicks + 1 }).eq("id", linkId),
    ]);

    return { url: targetUrl };
  });

export const Route = createFileRoute("/r/$code")({
  head: () => ({
    meta: [{ title: "Redirecionando..." }],
  }),
  beforeLoad: async ({ params }) => {
    const { url } = await resolveAndRegisterClick({ data: params.code });
    if (url) {
      throw redirect({ href: url });
    }
  },
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060B14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFF",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
          Link não encontrado
        </h1>
        <p style={{ fontSize: "16px", color: "#94A3B8" }}>
          Este link pode ter expirado ou não existe.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "24px",
            padding: "12px 24px",
            background: "#0EA5E9",
            color: "#FFF",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Voltar para LinkPulse
        </a>
      </div>
    </div>
  );
}
