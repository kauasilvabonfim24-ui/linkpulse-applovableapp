import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const { linkName, commission, todayClicks, totalClicks } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data } = await supabase.from("app_config").select("key, value");
  const config: Record<string, string> = {};
  (data || []).forEach((row: any) => { config[row.key] = row.value; });

  await fetch("https://onesignal.com/api/v1/notifications", {
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
        pt: `${linkName} · ${todayClicks} hoje · ${totalClicks} total · 💰 R$ ${commission}`,
        en: `${linkName} · ${todayClicks} hoje · ${totalClicks} total · 💰 R$ ${commission}`,
      },
      small_icon: "ic_stat_onesignal_default",
    }),
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
