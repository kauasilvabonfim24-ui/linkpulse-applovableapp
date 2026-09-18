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
    // register_click é uma função no banco (security definer) que resolve
    // o código, e só grava clique/dispara notificação se o link existir E
    // estiver ativo. Assim o redirect público não precisa de permissão
    // direta de escrita nas tabelas — importante agora que os links são
    // multi-tenant e protegidos por RLS por usuário.
    const { data, error } = await supabaseServer.rpc("register_click", { p_short: code });
    const targetUrl = !error && data && data.length > 0 ? data[0].target_url : null;
    return { url: targetUrl as string | null };
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
