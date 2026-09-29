-- Daily cleanup: orders that carry a payment screenshot are deleted 30 days after they
-- were placed, together with the screenshot file. The work itself happens in the
-- cleanup-old-orders Edge Function (files must be removed through the Storage API);
-- this job just calls it every night at 03:15 UTC. Safe to re-run
-- (cron.schedule replaces an existing job with the same name).
--
-- Replace the two placeholders before running:
--   __PROJECT_REF__     your project ref (the xxxx in https://xxxx.supabase.co)
--   __CLEANUP_SECRET__  the same value you set as the CLEANUP_SECRET function secret

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

delete from vault.secrets where name = 'cleanup_orders_secret';
select vault.create_secret('__CLEANUP_SECRET__', 'cleanup_orders_secret');

select cron.schedule(
  'cleanup-old-orders',
  '15 3 * * *',
  $$
  select net.http_post(
    url := 'https://__PROJECT_REF__.supabase.co/functions/v1/cleanup-old-orders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'cleanup_orders_secret'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
