-- 020_cron_reminders.sql
-- Minutely dispatch of the event reminder edge function

create or replace function public.invoke_event_reminder_30m()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    base_url text;
    service_role_key text;
begin
    select decrypted_secret
    into base_url
    from vault.decrypted_secrets
    where name = 'edge_function_base_url'
    limit 1;

    select decrypted_secret
    into service_role_key
    from vault.decrypted_secrets
    where name = 'service_role_key'
    limit 1;

    if base_url is null or service_role_key is null then
        raise warning 'invoke_event_reminder_30m: missing vault secrets edge_function_base_url/service_role_key';
        return;
    end if;

    perform net.http_post(
        url := base_url || '/functions/v1/event_reminder_30m',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'window_minutes', 30,
            'invoked_at', now()
        )::text,
        timeout_milliseconds := 5000
    );

    raise notice 'invoke_event_reminder_30m: dispatched edge function call';
exception
    when others then
        raise warning 'invoke_event_reminder_30m: %', sqlerrm;
end;
$$;

grant execute on function public.invoke_event_reminder_30m() to postgres;

select cron.unschedule('event-reminder-30m');

select cron.schedule(
    'event-reminder-30m',
    '* * * * *',
    $$
        select public.invoke_event_reminder_30m();
    $$
);
