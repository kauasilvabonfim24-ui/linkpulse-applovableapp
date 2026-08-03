import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "./lib/supabase";

// ── Types ──────────────────────────────────────────────────────────
interface ClickEvent { ts: number; ref: string; }
interface AffLink {
  id: string; name: string; url: string; short: string; code: string;
  platform: string; productValue: number; commission: number;
  valuePerClick: number; clicks: number; clicksByDay: Record<string, number>;
  clickEvents: ClickEvent[]; lastClick: number | null; createdAt: number;
}
type UpdateInput = { name: string; url: string; platform: string; productValue: number; commission: number; valuePerClick: number };

// ── Constants ──────────────────────────────────────────────────────
const SHORT_BASE = `${typeof window !== "undefined" ? window.location.origin : "https://linkpulse-applovableapp.lovable.app"}/r/`;

const PLATFORMS = [
  { label: "Hotmart",       color: "#FF6B35", commission: 50 },
  { label: "Kiwify",        color: "#A78BFA", commission: 50 },
  { label: "Eduzz",         color: "#38BDF8", commission: 40 },
  { label: "Monetizze",     color: "#34D399", commission: 40 },
  { label: "Amazon",        color: "#FBBF24", commission: 8  },
  { label: "Shopee",        color: "#FB923C", commission: 10 },
  { label: "Mercado Livre", color: "#FDE047", commission: 8  },
  { label: "Outro",         color: "#94A3B8", commission: 30 },
];

const PIE_COLORS = ["#0EA5E9","#00D4AA","#A78BFA","#FB923C","#F472B6","#34D399","#FBBF24"];
const CUSTOM_PLT_KEY = "linkpulse:customPlatforms";
const CUSTOM_COLORS = ["#F472B6","#22D3EE","#A78BFA","#FB923C","#34D399","#FBBF24","#F87171","#60A5FA"];
type Platform = { label: string; color: string; commission: number };

// ── Helpers ────────────────────────────────────────────────────────
const genCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();
const todayKey = () => new Date().toLocaleDateString("pt-BR");
const fmtMoney = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtNum = (v: number) => new Intl.NumberFormat("pt-BR").format(v);
const fmtDate = (ts: number) => new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtRelative = (ts: number | null) => {
  if (!ts) return "Sem cliques";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "agora mesmo";
  const m = Math.floor(s / 60); if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60); if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24); return `há ${d}d`;
};

function loadCustomPlatforms(): Platform[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_PLT_KEY) || "[]"); } catch { return []; }
}
function saveCustomPlatforms(list: Platform[]) {
  try { localStorage.setItem(CUSTOM_PLT_KEY, JSON.stringify(list)); } catch {}
}
function useCustomPlatforms(): [Platform[], (name: string) => void] {
  const [custom, setCustom] = useState<Platform[]>([]);
  useEffect(() => { setCustom(loadCustomPlatforms()); }, []);
  const add = (name: string) => {
    const t = name.trim(); if (!t) return;
    setCustom(prev => {
      if ([...PLATFORMS, ...prev].some(p => p.label.toLowerCase() === t.toLowerCase())) return prev;
      const next = [...prev, { label: t, color: CUSTOM_COLORS[prev.length % CUSTOM_COLORS.length], commission: 30 }];
      saveCustomPlatforms(next); return next;
    });
  };
  return [custom, add];
}
function getPlt(label: string, custom: Platform[]): Platform {
  return PLATFORMS.find(p => p.label === label) || custom.find(p => p.label === label) || PLATFORMS[7];
}

// ── Data ───────────────────────────────────────────────────────────
async function fetchAll(): Promise<AffLink[]> {
  const [{ data: links }, { data: events }] = await Promise.all([
    supabase.from("links").select("*").order("created_at", { ascending: false }),
    supabase.from("click_events").select("link_id, clicked_at, referrer"),
  ]);
  if (!links) return [];
  const evMap: Record<string, ClickEvent[]> = {};
  (events || []).forEach((e: any) => {
    const ts = new Date(e.clicked_at).getTime();
    (evMap[e.link_id] ||= []).push({ ts, ref: e.referrer || "Direto" });
  });
  return links.map((l: any) => {
    const evs = (evMap[l.id] || []).sort((a, b) => a.ts - b.ts);
    const cbd: Record<string, number> = {};
    evs.forEach(e => { const k = new Date(e.ts).toLocaleDateString("pt-BR"); cbd[k] = (cbd[k] || 0) + 1; });
    return {
      id: l.id, name: l.name, url: l.url,
      short: SHORT_BASE + l.short, code: l.short,
      platform: l.platform,
      productValue: Number(l.product_value), commission: Number(l.commission),
      valuePerClick: Number(l.value_per_click), clicks: Number(l.clicks || 0),
      clicksByDay: cbd, clickEvents: evs,
      lastClick: evs.length ? evs[evs.length - 1].ts : null,
      createdAt: new Date(l.created_at).getTime(),
    };
  });
}

// ══════════════════════════════════════════════════════════════════
// App Root
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [links, setLinks] = useState<AffLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"home" | "create" | "detail">("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => { if ("Notification" in window) setNotifPerm(Notification.permission); }, []);

  const refresh = useCallback(async () => { const d = await fetchAll(); setLinks(d); return d; }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { try { await refresh(); } finally { if (!cancelled) setLoading(false); } })();
    const ch = supabase.channel("lp-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "links" }, () => refresh())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "click_events" }, async (p) => {
        const lid = (p.new as any)?.link_id;
        if (lid) setLinks(prev => prev.map(l => l.id === lid ? { ...l, clicks: l.clicks + 1 } : l));
        refresh();
      }).subscribe();
    const pollId = setInterval(async () => {
      const { count } = await supabase.from("click_events").select("*", { count: "exact", head: true });
      if (count !== null) refresh();
    }, 15000);
    const onVis = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelled = true; supabase.removeChannel(ch); clearInterval(pollId); document.removeEventListener("visibilitychange", onVis); };
  }, [refresh]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const requestNotif = async () => {
    if (!(window as any).OneSignal) return showToast("OneSignal não carregou", "error");
    await (window as any).OneSignal.Notifications.requestPermission();
    const ok = (window as any).OneSignal.Notifications.permission;
    if (ok) { try { await (window as any).OneSignal.login("owner-linkpulse"); } catch { /* noop */ } }
    setNotifPerm(ok ? "granted" : "default");
    ok ? showToast("Notificações ativadas! 🔔") : showToast("Permissão negada", "error");
  };

  const copyLink = (short: string) => { navigator.clipboard?.writeText(short); showToast("Copiado! 📋"); };

  const createLink = async (input: UpdateInput) => {
    const code = genCode();
    const { error } = await supabase.from("links").insert({
      name: input.name, url: input.url, short: code, platform: input.platform,
      product_value: input.productValue, commission: input.commission,
      value_per_click: input.valuePerClick, clicks: 0,
    });
    if (error) { showToast("Erro ao criar", "error"); return; }
    setView("home"); showToast("Link criado! 🚀"); refresh();
  };

  const updateLink = async (id: string, input: UpdateInput) => {
    const { error } = await supabase.from("links").update({
      name: input.name, url: input.url, platform: input.platform,
      product_value: input.productValue, commission: input.commission,
      value_per_click: input.valuePerClick,
    }).eq("id", id);
    if (error) { showToast("Erro ao atualizar", "error"); return; }
    showToast("Atualizado! ✅"); refresh();
  };

  const deleteLink = async (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id)); setView("home");
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) { showToast("Erro ao remover", "error"); refresh(); } else showToast("Removido");
  };

  const selectedLink = links.find(l => l.id === selectedId) ?? null;

  if (loading) return (
    <div className="root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="pulse-ring" />
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className="root">
      {toast && <div className={`toast ${toast.type === "error" ? "toast-err" : "toast-ok"}`}>{toast.msg}</div>}
      {view === "home" && <HomeView links={links} notifPerm={notifPerm} onRequestNotif={requestNotif} onNew={() => setView("create")} onSelect={id => { setSelectedId(id); setView("detail"); }} onCopy={copyLink} />}
      {view === "create" && <CreateView onSave={createLink} onBack={() => setView("home")} />}
      {view === "detail" && selectedLink && <DetailView link={selectedLink} onBack={() => setView("home")} onCopy={copyLink} onDelete={() => deleteLink(selectedLink.id)} onUpdate={input => updateLink(selectedLink.id, input)} />}
      <nav className="tab-bar">
        <button className={`tab ${(view === "home" || view === "detail") ? "tab-active" : ""}`} onClick={() => { setView("home"); setSelectedId(null); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          <span>Painel</span>
        </button>
        <button className={`tab ${view === "create" ? "tab-active" : ""}`} onClick={() => setView("create")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          <span>Novo Link</span>
        </button>
      </nav>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// HomeView
// ══════════════════════════════════════════════════════════════════
function HomeView({ links, notifPerm, onRequestNotif, onNew, onSelect, onCopy }: {
  links: AffLink[]; notifPerm: string; onRequestNotif: () => void;
  onNew: () => void; onSelect: (id: string) => void; onCopy: (s: string) => void;
}) {
  const [customPlatforms] = useCustomPlatforms();
  const [filter, setFilter] = useState("Todos");
  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const totalEarnings = links.reduce((s, l) => s + l.clicks * l.valuePerClick, 0);
  const todayClicks = links.reduce((s, l) => s + (l.clicksByDay[todayKey()] || 0), 0);
  const topLink = [...links].sort((a, b) => b.clicks - a.clicks)[0];

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toLocaleDateString("pt-BR");
    return { label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), total: links.reduce((s, l) => s + (l.clicksByDay[k] || 0), 0) };
  });

  const usedPlatforms = Array.from(new Set(links.map(l => l.platform)));
  const filters = ["Todos", ...usedPlatforms];
  const filtered = filter === "Todos" ? links : links.filter(l => l.platform === filter);

  return (
    <div className="screen">
      {/* Header */}
      <div className="header">
        <div>
          <p className="eyebrow">Rastreador de Afiliados</p>
          <h1 className="brand-title">Link<span className="brand-accent">Pulse</span></h1>
        </div>
        <button onClick={onRequestNotif} className={`bell-btn ${notifPerm === "granted" ? "bell-on" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          {notifPerm === "granted" ? "Ativo" : "Ativar"}
        </button>
      </div>

      {/* Hero metrics */}
      <div className="metrics-row">
        <div className="metric-hero">
          <span className="metric-hero-val">{fmtNum(totalClicks)}</span>
          <span className="metric-hero-lbl">cliques totais</span>
        </div>
        <div className="metric-hero" style={{ alignItems: "flex-end" }}>
          <span className="metric-hero-val" style={{ color: "#00D4AA" }}>{fmtMoney(totalEarnings)}</span>
          <span className="metric-hero-lbl">ganhos est.</span>
        </div>
      </div>

      {/* Sub metrics */}
      <div className="sub-metrics">
        <div className="sub-metric">
          <span className="sub-val">{fmtNum(links.length)}</span>
          <span className="sub-lbl">links ativos</span>
        </div>
        <div className="sub-metric">
          <span className="sub-val" style={{ color: "#F59E0B" }}>{fmtNum(todayClicks)}</span>
          <span className="sub-lbl">hoje</span>
        </div>
        {topLink && (
          <div className="sub-metric" style={{ flex: 2 }}>
            <span className="sub-val" style={{ color: "#0EA5E9", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{topLink.name}</span>
            <span className="sub-lbl">top link</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {links.length > 0 && (
        <div className="chart-block">
          <p className="section-label">Últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={days7} barSize={22}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#00D4AA" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#0EA5E9" }} />
              <Bar dataKey="total" fill="url(#cg)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Links */}
      <div className="links-block">
        <div className="links-header">
          <p className="section-label">Meus Links</p>
          <button onClick={onNew} className="btn-new">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Novo
          </button>
        </div>

        {links.length > 0 && filters.length > 1 && (
          <div className="filter-row">
            {filters.map(f => {
              const color = f === "Todos" ? "#0EA5E9" : getPlt(f, customPlatforms).color;
              return (
                <button key={f} onClick={() => setFilter(f)} className={`filter-chip ${filter === f ? "filter-active" : ""}`}
                  style={filter === f ? { borderColor: color, background: color + "22", color } : {}}>
                  {f}
                </button>
              );
            })}
          </div>
        )}

        {links.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📡</div>
            <p className="empty-title">Nenhum link ainda</p>
            <p className="empty-sub">Crie seu primeiro link e monitore cada clique em tempo real</p>
            <button onClick={onNew} className="btn-primary" style={{ marginTop: 20 }}>Criar primeiro link</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty"><p className="empty-sub">Nenhum link para {filter}</p></div>
        ) : filtered.map(l => <LinkRow key={l.id} link={l} onSelect={() => onSelect(l.id)} onCopy={() => onCopy(l.short)} customPlatforms={customPlatforms} />)}
      </div>
    </div>
  );
}

function LinkRow({ link, onSelect, onCopy, customPlatforms }: { link: AffLink; onSelect: () => void; onCopy: () => void; customPlatforms: Platform[] }) {
  const plt = getPlt(link.platform, customPlatforms);
  const today = link.clicksByDay[todayKey()] || 0;
  return (
    <div className="link-row" onClick={onSelect}>
      <div className="link-row-dot" style={{ background: plt.color }} />
      <div className="link-row-body">
        <div className="link-row-top">
          <p className="link-row-name">{link.name}</p>
          <span className="link-row-clicks">{fmtNum(link.clicks)}</span>
        </div>
        <div className="link-row-meta">
          <span className="plt-tag" style={{ color: plt.color }}>{link.platform}</span>
          {today > 0 && <span className="today-tag">+{today} hoje</span>}
          <span className="time-tag">{fmtRelative(link.lastClick)}</span>
        </div>
        <div className="link-row-bottom">
          <span className="link-row-short">{link.short}</span>
          <button className="copy-tiny" onClick={e => { e.stopPropagation(); onCopy(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            Copiar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CreateView
// ══════════════════════════════════════════════════════════════════
function CreateView({ onSave, onBack }: { onSave: (i: UpdateInput) => void; onBack: () => void }) {
  const [customPlatforms, addCustomPlatform] = useCustomPlatforms();
  const [name, setName] = useState(""); const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("Hotmart"); const [prodVal, setProdVal] = useState("");
  const [comm, setComm] = useState("50"); const [errors, setErrors] = useState<Record<string, string>>({});
  const [addingCustom, setAddingCustom] = useState(false); const [customName, setCustomName] = useState("");
  const allPlatforms = [...PLATFORMS, ...customPlatforms];
  const est = prodVal && comm ? +prodVal * (+comm / 100) * 0.015 : 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Obrigatório";
    if (!url.trim()) e.url = "Obrigatório"; else { try { new URL(url); } catch { e.url = "URL inválida"; } }
    if (!prodVal || isNaN(+prodVal) || +prodVal <= 0) e.prodVal = "Valor inválido";
    if (!comm || isNaN(+comm) || +comm <= 0 || +comm > 100) e.comm = "Entre 1 e 100";
    setErrors(e); return !Object.keys(e).length;
  };

  return (
    <div className="screen">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} className="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div><h2 className="page-title">Novo Link</h2><p className="muted" style={{ fontSize: 12 }}>Encurte e rastreie em tempo real</p></div>
        </div>
      </div>

      <div className="form-wrap">
        <div className="field-group">
          <label className="field-lbl">Plataforma</label>
          <div className="plt-scroll">
            {allPlatforms.map(p => (
              <button key={p.label} onClick={() => { setPlatform(p.label); setComm(String(p.commission)); }}
                className={`plt-chip ${platform === p.label ? "plt-chip-active" : ""}`}
                style={platform === p.label ? { borderColor: p.color, background: p.color + "22", color: p.color } : {}}>
                {p.label}
              </button>
            ))}
            <button onClick={() => setAddingCustom(v => !v)} className="plt-chip plt-chip-add">+ Adicionar</button>
          </div>
          {addingCustom && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input className="input" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Nome da plataforma" />
              <button className="btn-primary btn-sm" onClick={() => { addCustomPlatform(customName); setPlatform(customName.trim()); setCustomName(""); setAddingCustom(false); }}>OK</button>
            </div>
          )}
        </div>

        <Field label="Nome do produto" value={name} onChange={setName} placeholder="Ex: Fone Bluetooth" error={errors.name} />
        <Field label="Link do afiliado" value={url} onChange={setUrl} placeholder="https://..." error={errors.url} />
        <div className="two-col">
          <Field label="Valor (R$)" value={prodVal} onChange={setProdVal} placeholder="197" type="number" error={errors.prodVal} />
          <Field label="Comissão (%)" value={comm} onChange={setComm} placeholder="50" type="number" error={errors.comm} />
        </div>

        {est > 0 && (
          <div className="est-card">
            <p className="section-label" style={{ marginBottom: 12 }}>Estimativa</p>
            <div className="est-grid">
              <EstItem label="por clique*" value={fmtMoney(est)} color="#0EA5E9" />
              <EstItem label="100 cliques" value={fmtMoney(est * 100)} color="#00D4AA" />
              <EstItem label="por venda" value={fmtMoney(+prodVal * (+comm / 100))} color="#A78BFA" />
              <EstItem label="10 vendas" value={fmtMoney(+prodVal * (+comm / 100) * 10)} color="#F59E0B" />
            </div>
            <p style={{ fontSize: 10, color: "#475569", marginTop: 8 }}>*Conversão estimada de 1,5%</p>
          </div>
        )}

        <button onClick={() => { if (validate()) onSave({ name: name.trim(), url: url.trim(), platform, productValue: +prodVal, commission: +comm, valuePerClick: +prodVal * (+comm / 100) * 0.015 }); }} className="btn-primary btn-full">
          Criar Link →
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", error }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; error?: string }) {
  return (
    <div className="field-group">
      <label className="field-lbl">{label}</label>
      <input className={`input ${error ? "input-err" : ""}`} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      {error && <p className="err-msg">{error}</p>}
    </div>
  );
}

function EstItem({ label, value, color }: { label: string; value: string; color: string }) {
  return <div><p style={{ fontSize: 16, fontWeight: 800, color }}>{value}</p><p style={{ fontSize: 10, color: "#64748B" }}>{label}</p></div>;
}

// ══════════════════════════════════════════════════════════════════
// DetailView
// ══════════════════════════════════════════════════════════════════
function DetailView({ link, onBack, onCopy, onDelete, onUpdate }: { link: AffLink; onBack: () => void; onCopy: (s: string) => void; onDelete: () => void; onUpdate: (i: UpdateInput) => void }) {
  const [customPlatforms] = useCustomPlatforms();
  const plt = getPlt(link.platform, customPlatforms);
  const [editing, setEditing] = useState(false);
  const [period, setPeriod] = useState<"7" | "30" | "month">("7");
  const today = link.clicksByDay[todayKey()] || 0;

  const periodData = (() => {
    const now = new Date(); let start: Date; let days: number;
    if (period === "7") { start = new Date(); start.setDate(now.getDate() - 6); days = 7; }
    else if (period === "30") { start = new Date(); start.setDate(now.getDate() - 29); days = 30; }
    else { start = new Date(now.getFullYear(), now.getMonth(), 1); days = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1; }
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = d.toLocaleDateString("pt-BR");
      return { label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), cliques: link.clicksByDay[k] || 0 };
    });
  })();

  const hoursData = Array.from({ length: 24 }, (_, h) => ({ label: `${h}h`, cliques: 0 }));
  (link.clickEvents || []).forEach(e => { hoursData[new Date(e.ts).getHours()].cliques++; });

  const refCount: Record<string, number> = {};
  (link.clickEvents || []).forEach(e => { refCount[e.ref] = (refCount[e.ref] || 0) + 1; });
  const pieData = Object.entries(refCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="screen">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <button onClick={onBack} className="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span className="plt-tag" style={{ color: plt.color }}>{link.platform}</span>
              {link.lastClick && <span className="time-tag">{fmtDate(link.lastClick)}</span>}
            </div>
            <h2 className="page-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.name}</h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditing(true)} className="icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          </button>
          <button onClick={onDelete} className="icon-btn icon-btn-danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
          </button>
        </div>
      </div>

      {editing && <EditModal link={link} onClose={() => setEditing(false)} onSave={input => { onUpdate(input); setEditing(false); }} />}

      {/* Short link */}
      <div className="short-block">
        <span className="short-url">{link.short}</span>
        <button onClick={() => onCopy(link.short)} className="btn-primary btn-sm">Copiar link</button>
      </div>

      <div className="detail-wrap">
        {/* Stats */}
        <div className="stat-row">
          <StatBox label="Cliques" value={fmtNum(link.clicks)} color="#0EA5E9" />
          <StatBox label="Ganhos Est." value={fmtMoney(link.clicks * link.valuePerClick)} color="#00D4AA" />
          <StatBox label="Hoje" value={fmtNum(today)} color="#F59E0B" />
          <StatBox label="Por Venda" value={fmtMoney(link.productValue * link.commission / 100)} color="#A78BFA" />
        </div>

        {/* Period chart */}
        <div className="chart-block">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p className="section-label" style={{ margin: 0 }}>Cliques</p>
            <div style={{ display: "flex", gap: 6 }}>
              {([["7", "7d"], ["30", "30d"], ["month", "Mês"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setPeriod(v)} className={`period-btn ${period === v ? "period-active" : ""}`}>{l}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={periodData}>
              <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#00D4AA" /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#0EA5E9" }} />
              <Line type="monotone" dataKey="cliques" stroke="url(#lg)" strokeWidth={2.5} dot={{ fill: "#0EA5E9", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hours */}
        <div className="chart-block">
          <p className="section-label">Horários com mais cliques</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={hoursData} barSize={6}>
              <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00D4AA" /><stop offset="100%" stopColor="#0EA5E9" /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 8 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#00D4AA" }} />
              <Bar dataKey="cliques" fill="url(#hg)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        {pieData.length > 0 && (
          <div className="chart-block">
            <p className="section-label">Origens</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <PieChart width={110} height={110}>
                <Pie data={pieData} cx={50} cy={50} innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity */}
        {(link.clickEvents || []).length > 0 && (
          <div className="chart-block">
            <p className="section-label">Atividade recente</p>
            {[...link.clickEvents].reverse().slice(0, 8).map((e, i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #1E293B" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4AA" }} />
                  <span style={{ fontSize: 12 }}>via {e.ref}</span>
                </div>
                <span style={{ fontSize: 11, color: "#475569" }}>{fmtDate(e.ts)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-box">
      <span className="stat-box-val" style={{ color }}>{value}</span>
      <span className="stat-box-lbl">{label}</span>
    </div>
  );
}

// ── EditModal ──────────────────────────────────────────────────────
function EditModal({ link, onClose, onSave }: { link: AffLink; onClose: () => void; onSave: (i: UpdateInput) => void }) {
  const [customPlatforms, addCustomPlatform] = useCustomPlatforms();
  const [name, setName] = useState(link.name); const [url, setUrl] = useState(link.url);
  const [platform, setPlatform] = useState(link.platform); const [prodVal, setProdVal] = useState(String(link.productValue));
  const [comm, setComm] = useState(String(link.commission)); const [errors, setErrors] = useState<Record<string, string>>({});
  const [addingCustom, setAddingCustom] = useState(false); const [customName, setCustomName] = useState("");
  const allPlatforms = [...PLATFORMS, ...customPlatforms];
  if (!allPlatforms.some(p => p.label === platform)) allPlatforms.push({ label: platform, color: "#94A3B8", commission: +comm || 30 });

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Obrigatório";
    if (!url.trim()) e.url = "Obrigatório"; else { try { new URL(url); } catch { e.url = "URL inválida"; } }
    if (!prodVal || isNaN(+prodVal) || +prodVal <= 0) e.prodVal = "Valor inválido";
    if (!comm || isNaN(+comm) || +comm <= 0 || +comm > 100) e.comm = "Entre 1 e 100";
    setErrors(e); if (Object.keys(e).length) return;
    onSave({ name: name.trim(), url: url.trim(), platform, productValue: +prodVal, commission: +comm, valuePerClick: +prodVal * (+comm / 100) * 0.015 });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0F172A", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", borderRadius: "20px 20px 0 0", border: "1px solid #1E293B", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Editar Link</h2>
          <button onClick={onClose} className="back-btn">✕</button>
        </div>
        <div className="field-group">
          <label className="field-lbl">Plataforma</label>
          <div className="plt-scroll">
            {allPlatforms.map(p => (
              <button key={p.label} onClick={() => { setPlatform(p.label); setComm(String(p.commission)); }}
                className={`plt-chip ${platform === p.label ? "plt-chip-active" : ""}`}
                style={platform === p.label ? { borderColor: p.color, background: p.color + "22", color: p.color } : {}}>
                {p.label}
              </button>
            ))}
            <button onClick={() => setAddingCustom(v => !v)} className="plt-chip plt-chip-add">+ Adicionar</button>
          </div>
          {addingCustom && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input className="input" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Nome da plataforma" />
              <button className="btn-primary btn-sm" onClick={() => { addCustomPlatform(customName); setPlatform(customName.trim()); setCustomName(""); setAddingCustom(false); }}>OK</button>
            </div>
          )}
        </div>
        <Field label="Nome do produto" value={name} onChange={setName} placeholder="Ex: Fone Bluetooth" error={errors.name} />
        <Field label="URL do afiliado" value={url} onChange={setUrl} placeholder="https://..." error={errors.url} />
        <div className="two-col">
          <Field label="Valor (R$)" value={prodVal} onChange={setProdVal} placeholder="197" type="number" error={errors.prodVal} />
          <Field label="Comissão (%)" value={comm} onChange={setComm} placeholder="50" type="number" error={errors.comm} />
        </div>
        <button onClick={handleSave} className="btn-primary btn-full" style={{ marginTop: 16 }}>Salvar alterações</button>
      </div>
    </div>
  );
}
