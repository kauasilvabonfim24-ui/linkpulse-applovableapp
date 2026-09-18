import { useState } from "react";
import { supabase } from "../lib/supabase";

// Tela de login e criação de conta. Usa o Supabase Auth (e-mail + senha).
// Ao criar conta, um trigger no banco (handle_new_user) já cria o perfil
// do usuário automaticamente com 7 dias de teste grátis do plano Pro.
export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Conta criada! Verifique seu e-mail para confirmar (se a confirmação estiver ativada) e depois faça login.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err?.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : (err?.message || "Algo deu errado."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060B14", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 360, background: "#0B1220", border: "1px solid #1E293B", borderRadius: 16, padding: 28 }}>
        <h1 style={{ color: "#FFF", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>LinkPulse</h1>
        <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 24 }}>
          {mode === "login" ? "Entre na sua conta" : "Crie sua conta grátis — 7 dias de teste do plano Pro"}
        </p>

        <label style={{ color: "#CBD5E1", fontSize: 12, display: "block", marginBottom: 6 }}>E-mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="voce@email.com"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1E293B", background: "#060B14", color: "#FFF", marginBottom: 14, fontSize: 14 }}
        />

        <label style={{ color: "#CBD5E1", fontSize: 12, display: "block", marginBottom: 6 }}>Senha</label>
        <input
          type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1E293B", background: "#060B14", color: "#FFF", marginBottom: 18, fontSize: 14 }}
        />

        {error && <p style={{ color: "#F87171", fontSize: 13, marginBottom: 14 }}>{error}</p>}
        {info && <p style={{ color: "#34D399", fontSize: 13, marginBottom: 14 }}>{info}</p>}

        <button
          type="submit" disabled={loading}
          style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#0EA5E9", color: "#FFF", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta grátis"}
        </button>

        <button
          type="button"
          onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(null); setInfo(null); }}
          style={{ width: "100%", marginTop: 14, background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer" }}
        >
          {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}
