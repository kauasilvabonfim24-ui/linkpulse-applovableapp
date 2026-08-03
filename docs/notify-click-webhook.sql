-- =====================================================================
-- Disparo 100% server-side da notificação push (notify-click)
-- Rode este SQL no SQL Editor do Supabase (projeto dsgxkhpeomdadzfkfadu).
--
-- Ele cria um trigger AFTER INSERT em click_events que chama a Edge
-- Function notify-click via pg_net (HTTP assíncrono), passando o linkId.
-- Assim a notificação não depende mais do navegador (fim do "EarlyDrop").
-- =====================================================================

-- 1) Extensão de HTTP assíncrono
create extension if not exists pg_net with schema extensions;

-- 2) Função do trigger
--    Substitua <ANON_OR_SERVICE_KEY> pela anon key do projeto
--    (sb_publishable_BdTgJVPErF9ta0z5vZZLLQ_V5nuSAqM) ou pela service role key.
create or replace function public.notify_click_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url     := 'https://dsgxkhpeomdadzfkfadu.supabase.co/functions/v1/notify-click',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_OR_SERVICE_KEY>',
      'apikey', '<ANON_OR_SERVICE_KEY>'
    ),
    body    := jsonb_build_object('linkId', NEW.link_id),
    timeout_milliseconds := 5000
  );
  return NEW;
end;
$$;

-- 3) Trigger em todo INSERT
drop trigger if exists trg_notify_click on public.click_events;
create trigger trg_notify_click
after insert on public.click_events
for each row
execute function public.notify_click_on_insert();

-- 4) (Opcional) conferir as chamadas feitas pelo pg_net:
-- select * from net._http_response order by created desc limit 10;
