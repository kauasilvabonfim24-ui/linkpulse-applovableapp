import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const body = await req.json().catch(() => ({} as any));
  const { linkId, linkName: nameOverride, commission: commissionOverride } = body || {};

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Load config + link + counts IN PARALLEL server-side to minimize latency.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [configRes, linkRes, todayRes, totalRes] = await Promise.all([
    supabase.from("app_config").select("key, value"),
    linkId
      ? supabase.from("links").select("name, commission").eq("id", linkId).maybeSingle()
      : Promise.resolve({ data: null } as any),
    linkId
      ? supabase
          .from("click_events")
          .select("*", { count: "exact", head: true })
          .eq("link_id", linkId)
          .gte("clicked_at", startOfDay.toISOString())
      : Promise.resolve({ count: 0 } as any),
    linkId
      ? supabase
          .from("click_events")
          .select("*", { count: "exact", head: true })
          .eq("link_id", linkId)
      : Promise.resolve({ count: 0 } as any),
  ]);

  const config: Record<string, string> = {};
  (configRes.data || []).forEach((row: any) => { config[row.key] = row.value; });

  const linkName = (linkRes as any)?.data?.name ?? nameOverride ?? "Link";
  const commission = (linkRes as any)?.data?.commission ?? commissionOverride ?? 0;
  const todayClicks = (todayRes as any)?.count ?? 0;
  const totalClicks = (totalRes as any)?.count ?? 0;

  // Fire OneSignal — priority 10 + ttl 60 for immediate mobile push delivery.
  const osRes = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": config.onesignal_rest_api_key,
    },
    body: JSON.stringify({
      app_id: config.onesignal_app_id,
      include_subscription_ids: [config.onesignal_subscription_id],
      headings: { pt: "📡 Novo clique!", en: "📡 Novo clique!" },
      contents: {
        pt: `${linkName} | Hoje: ${todayClicks} · Total: ${totalClicks} · 💰 R$ ${commission}`,
        en: `${linkName} | Hoje: ${todayClicks} · Total: ${totalClicks} · 💰 R$ ${commission}`,
      },
      small_icon: "ic_stat_onesignal_default",
      priority: 10,
      ttl: 60,
      android_channel_id: undefined,
    }),
  });

  const osBody = await osRes.text();
  return new Response(JSON.stringify({ ok: osRes.ok, status: osRes.status, os: osBody }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
