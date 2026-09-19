import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const CAKTO_BASICO = "https://pay.cakto.com.br/9aivs8b_1119807";
const CAKTO_PRO = "https://pay.cakto.com.br/wkrgo3z_1119818";

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Landing() {
  const [clicks, setClicks] = useState(47);
  useEffect(() => {
    const id = setInterval(() => setClicks((c) => c + 1), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-root">
      <style>{CSS}</style>

      <nav className="lp-top">
        <div className="lp-wrap">
          <div className="lp-brand">
            <span className="lp-brand-mark">
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 12a4 4 0 0 0 6 3.5l2-2a4 4 0 0 0-5.5-5.5" stroke="#04101C" strokeWidth="2" strokeLinecap="round" /><path d="M15 12a4 4 0 0 0-6-3.5l-2 2a4 4 0 0 0 5.5 5.5" stroke="#04101C" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
            LinkPulse
          </div>
          <div className="lp-nav-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
          </div>
          <Link to="/app" search={{ signup: true }} className="lp-btn lp-btn-primary">Criar conta grátis</Link>
        </div>
      </nav>

      <section className="lp-hero" style={{ borderTop: "none" }}>
        <div className="lp-wrap lp-hero-grid">
          <div>
            <div className="lp-kicker">Pra quem vive de link de afiliado</div>
            <h1 className="lp-headline">Você manda o link no grupo. <span className="lp-hl">O LinkPulse avisa quando alguém clica.</span></h1>
            <p className="lp-sub">Encurta seus links de Shopee e Mercado Livre, divulga onde já divulga hoje, e acompanha cada clique em tempo real — sem precisar ficar checando nada manualmente.</p>
            <div className="lp-hero-ctas">
              <Link to="/app" search={{ signup: true }} className="lp-btn lp-btn-primary">Criar conta grátis</Link>
              <a href="#como-funciona" className="lp-btn lp-btn-ghost">Ver como funciona</a>
            </div>
            <p className="lp-hero-note">7 dias de teste do plano Pro, sem precisar cadastrar cartão.</p>
          </div>
          <div className="lp-phone">
            <div className="lp-phone-head">
              <span className="lp-phone-avatar">💬</span>
              <div><strong>Grupo Ofertas SP</strong><span>128 participantes</span></div>
            </div>
            <div className="lp-bubble">🔥 Fone bluetooth com 40% off <br /><span className="lp-lnk">linkpulse.app/r/8kQ2</span></div>
            <p className="lp-bubble-time">Enviado às 14:32</p>
            <div className="lp-pulse-card">
              <div>
                <div className="lp-label"><span className="lp-dot" />cliques nesse link</div>
                <div className="lp-count lp-tnum">{clicks}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="lp-label">agora mesmo</div>
                <div style={{ fontSize: 13, color: "var(--lp-green)", fontWeight: 600 }}>+1 clique</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <h2>Do link bruto ao clique registrado, em três passos</h2>
            <p>Nada de planilha, nada de ficar recarregando o Shopee Ads. O rastreio roda sozinho.</p>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-n">01</div>
              <h3>Cole o link de afiliado</h3>
              <p>Shopee, Mercado Livre ou qualquer outro — o LinkPulse gera um link curto próprio na hora.</p>
            </div>
            <div className="lp-step">
              <div className="lp-n">02</div>
              <h3>Divulgue onde já divulga</h3>
              <p>Grupo de WhatsApp, status, bio — o link curto funciona em qualquer lugar que você já usa hoje.</p>
            </div>
            <div className="lp-step">
              <div className="lp-n">03</div>
              <h3>Veja o clique chegar</h3>
              <p>Notificação na hora que alguém clica, gráfico de desempenho por link e por dia, tudo num painel só.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="lp-wrap">
          <div className="lp-section-head">
            <h2>Feito pra quem divulga todo dia, não pra empresa de marketing</h2>
            <p>Sem recurso corporativo que você nunca vai usar. Só o que ajuda a vender mais.</p>
          </div>
          <div className="lp-feature-grid">
            <div className="lp-feature">
              <div className="lp-ico"><svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeWidth="2" strokeLinejoin="round" stroke="currentColor" /></svg></div>
              <h3>Clique em tempo real</h3>
              <p>Notificação chega no seu celular assim que alguém abre o link — sem atraso, sem precisar atualizar página.</p>
            </div>
            <div className="lp-feature">
              <div className="lp-ico"><svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18M7 15l4-5 3 3 5-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" /></svg></div>
              <h3>Desempenho por link</h3>
              <p>Veja quais produtos e quais grupos estão trazendo mais clique, e onde vale a pena insistir.</p>
            </div>
            <div className="lp-feature">
              <div className="lp-ico"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M17.5 17.5 15 15M6 18l2.5-2.5M17.5 6.5 15 9" strokeWidth="2" strokeLinecap="round" stroke="currentColor" /></svg></div>
              <h3>Link continua funcionando</h3>
              <p>Mesmo depois de você organizar ou remover um link do seu painel, quem clicou continua sendo direcionado certinho.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="planos">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <h2>Escolha o plano do seu ritmo de divulgação</h2>
            <p>Comece grátis, sem cartão. Muda de plano quando o volume de links pedir.</p>
          </div>
          <div className="lp-plans">
            <div className="lp-plan">
              <div className="lp-plan-name">Grátis</div>
              <div className="lp-plan-note">pra testar e organizar seus primeiros links</div>
              <div className="lp-price"><span className="lp-amount">R$0</span></div>
              <ul>
                <li><Check />Até 3 links ativos</li>
                <li><Check />Cliques ilimitados</li>
                <li><Check />Notificação de clique em tempo real</li>
              </ul>
              <Link to="/app" search={{ signup: true }} className="lp-btn lp-btn-ghost">Criar conta grátis</Link>
            </div>
            <div className="lp-plan">
              <div className="lp-plan-name">Básico</div>
              <div className="lp-plan-note">pra quem já divulga vários produtos por semana</div>
              <div className="lp-price"><span className="lp-amount">R$29,90</span><span className="lp-period">/mês</span></div>
              <ul>
                <li><Check />Até 25 links ativos</li>
                <li><Check />Dashboard com gráfico por link e por dia</li>
                <li><Check />Suporte por e-mail</li>
              </ul>
              <a href={CAKTO_BASICO} className="lp-btn lp-btn-primary">Assinar Básico</a>
            </div>
            <div className="lp-plan lp-plan-pro">
              <div className="lp-plan-name">Pro</div>
              <div className="lp-plan-note">pra quem roda campanha grande e não quer pensar em limite</div>
              <div className="lp-price"><span className="lp-amount">R$59,90</span><span className="lp-period">/mês</span></div>
              <ul>
                <li><Check />Links ativos ilimitados</li>
                <li><Check />Tudo do plano Básico</li>
                <li><Check />Suporte prioritário</li>
              </ul>
              <a href={CAKTO_PRO} className="lp-btn lp-btn-primary">Assinar Pro</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="lp-wrap">
          <div className="lp-brand" style={{ fontSize: 14 }}>
            <span className="lp-brand-mark" style={{ width: 20, height: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 12, height: 12 }}><path d="M9 12a4 4 0 0 0 6 3.5l2-2a4 4 0 0 0-5.5-5.5" stroke="#04101C" strokeWidth="2" strokeLinecap="round" /><path d="M15 12a4 4 0 0 0-6-3.5l-2 2a4 4 0 0 0 5.5 5.5" stroke="#04101C" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
            LinkPulse
          </div>
          <p>© 2026 LinkPulse. Feito pra quem divulga todo dia.</p>
        </div>
      </footer>
    </div>
  );
}

// Estilos com prefixo "lp-" de propósito, pra nunca colidir com o CSS
// global do painel (linkpulse.css) — essa página vive fora dele.
const CSS = `
.lp-root {
  --lp-bg: #060B14; --lp-surface: #0B1220; --lp-surface-2: #0F1729;
  --lp-border: #1E293B; --lp-text: #F1F5F9; --lp-muted: #94A3B8;
  --lp-accent: #0EA5E9; --lp-accent-soft: rgba(14,165,233,0.12);
  --lp-amber: #F5A524; --lp-amber-soft: rgba(245,165,36,0.12); --lp-green: #34D399;
  background: var(--lp-bg); color: var(--lp-text);
  font-family: 'Inter', system-ui, sans-serif; line-height: 1.55; min-height: 100vh;
}
.lp-root h1, .lp-root h2, .lp-root h3 { font-family: 'Sora', 'Inter', sans-serif; letter-spacing: -0.02em; }
.lp-root a { color: inherit; }
.lp-root * { box-sizing: border-box; }
.lp-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.lp-tnum { font-variant-numeric: tabular-nums; }
.lp-top { position: sticky; top: 0; z-index: 40; backdrop-filter: blur(10px);
  background: rgba(6,11,20,0.82); border-bottom: 1px solid var(--lp-border); }
.lp-top .lp-wrap { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.lp-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; }
.lp-brand-mark { width: 26px; height: 26px; border-radius: 7px; background: var(--lp-accent);
  display: flex; align-items: center; justify-content: center; }
.lp-brand-mark svg { width: 15px; height: 15px; }
.lp-nav-links { display: flex; gap: 28px; font-size: 14.5px; color: var(--lp-muted); }
.lp-nav-links a:hover { color: var(--lp-text); }
.lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 20px; border-radius: 10px; font-weight: 600; font-size: 14.5px;
  text-decoration: none; border: 1px solid transparent; cursor: pointer; }
.lp-btn-primary { background: var(--lp-accent); color: #04101C; }
.lp-btn-primary:hover { filter: brightness(1.08); }
.lp-btn-ghost { border-color: var(--lp-border); color: var(--lp-text); }
.lp-btn-ghost:hover { background: var(--lp-surface); }
@media (max-width: 760px) { .lp-nav-links { display: none; } }
.lp-hero { padding: 76px 0 84px; }
.lp-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; }
@media (max-width: 900px) { .lp-hero-grid { grid-template-columns: 1fr; gap: 44px; } }
.lp-kicker { color: var(--lp-accent); font-size: 14.5px; font-weight: 600; margin-bottom: 18px; }
.lp-headline { font-size: clamp(34px, 4.6vw, 52px); line-height: 1.08; margin: 0 0 22px; font-weight: 800; }
.lp-headline .lp-hl { color: var(--lp-accent); }
.lp-sub { font-size: 17.5px; color: var(--lp-muted); max-width: 46ch; margin: 0 0 32px; }
.lp-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 22px; }
.lp-hero-note { font-size: 13.5px; color: var(--lp-muted); }
.lp-phone { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 26px;
  padding: 20px; max-width: 340px; margin: 0 auto; box-shadow: 0 30px 60px -30px rgba(0,0,0,0.5); }
.lp-phone-head { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; margin-bottom: 14px;
  border-bottom: 1px solid var(--lp-border); }
.lp-phone-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--lp-green);
  display: flex; align-items: center; justify-content: center; font-size: 15px; }
.lp-phone-head strong { font-size: 14px; display: block; }
.lp-phone-head span { font-size: 12px; color: var(--lp-muted); }
.lp-bubble { background: var(--lp-surface-2); border-radius: 14px 14px 14px 4px; padding: 12px 14px;
  font-size: 13.5px; margin-bottom: 6px; max-width: 92%; }
.lp-bubble .lp-lnk { color: var(--lp-accent); font-weight: 600; word-break: break-all; }
.lp-bubble-time { font-size: 11px; color: var(--lp-muted); margin: 0 0 16px 4px; }
.lp-pulse-card { background: var(--lp-surface-2); border: 1px solid var(--lp-border); border-radius: 14px;
  padding: 16px; display: flex; align-items: center; justify-content: space-between; }
.lp-label { font-size: 12px; color: var(--lp-muted); margin-bottom: 4px; }
.lp-count { font-size: 26px; font-weight: 700; }
.lp-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--lp-green); display: inline-block;
  margin-right: 6px; animation: lp-blink 1.6s infinite; }
@keyframes lp-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
.lp-root section { padding: 72px 0; border-top: 1px solid var(--lp-border); }
.lp-section-head { max-width: 60ch; margin-bottom: 44px; }
.lp-section-head h2 { font-size: clamp(24px, 3vw, 32px); margin: 0 0 12px; font-weight: 700; }
.lp-section-head p { color: var(--lp-muted); font-size: 16px; margin: 0; }
.lp-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
@media (max-width: 820px) { .lp-feature-grid, .lp-steps { grid-template-columns: 1fr; } }
.lp-feature .lp-ico { width: 38px; height: 38px; border-radius: 9px; background: var(--lp-accent-soft);
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.lp-feature .lp-ico svg { width: 19px; height: 19px; color: var(--lp-accent); }
.lp-feature h3 { font-size: 17px; margin: 0 0 8px; font-weight: 600; }
.lp-feature p { font-size: 14.5px; color: var(--lp-muted); margin: 0; }
.lp-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: stretch; }
@media (max-width: 900px) { .lp-plans { grid-template-columns: 1fr; } }
.lp-plan { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 16px;
  padding: 28px 26px; display: flex; flex-direction: column; }
.lp-plan-pro { border-color: var(--lp-amber); border-width: 1.5px;
  background: linear-gradient(180deg, var(--lp-amber-soft), var(--lp-surface) 140px); }
.lp-plan-name { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
.lp-plan-pro .lp-plan-name { color: var(--lp-amber); }
.lp-plan-note { font-size: 13px; color: var(--lp-muted); margin-bottom: 18px; min-height: 18px; }
.lp-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 22px; }
.lp-amount { font-size: 34px; font-weight: 800; font-family: 'Sora', sans-serif; }
.lp-period { font-size: 14px; color: var(--lp-muted); }
.lp-plan ul { list-style: none; margin: 0 0 26px; padding: 0; display: flex; flex-direction: column; gap: 11px; }
.lp-plan li { font-size: 14px; display: flex; gap: 10px; align-items: flex-start; color: var(--lp-text); }
.lp-plan li svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px; color: var(--lp-accent); }
.lp-plan-pro li svg { color: var(--lp-amber); }
.lp-plan .lp-btn { width: 100%; margin-top: auto; }
.lp-plan-pro .lp-btn-primary { background: var(--lp-amber); color: #2B1900; }
.lp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.lp-step { border-left: 2px solid var(--lp-border); padding-left: 18px; }
.lp-step .lp-n { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px; color: var(--lp-accent); margin-bottom: 8px; }
.lp-step h3 { font-size: 16px; margin: 0 0 6px; font-weight: 600; }
.lp-step p { font-size: 14px; color: var(--lp-muted); margin: 0; }
.lp-root footer { border-top: 1px solid var(--lp-border); padding: 32px 0; }
.lp-root footer .lp-wrap { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.lp-root footer p { color: var(--lp-muted); font-size: 13px; margin: 0; }
`;
