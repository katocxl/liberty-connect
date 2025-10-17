-- 010_cron_ttls.sql
-- Hourly housekeeping job for expiring content and report telemetry

create or replace function public.housekeeping_ttl()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    expired_announcements integer := 0;
    report_buckets jsonb := '[]'::jsonb;
begin
    update public.announcements
    set hidden_at = now(),
        pinned = false,
        updated_at = now()
    where expires_at is not null
      and expires_at < now()
      and hidden_at is null;
    get diagnostics expired_announcements = row_count;

    raise notice 'housekeeping_ttl: announcements hidden=%', expired_announcements;

    select coalesce(
        jsonb_agg(
            jsonb_build_object('bucket', bucket, 'count', bucket_count)
        ),
        '[]'::jsonb
    )
    into report_buckets
    from (
        select
            case
                when created_at >= now() - interval '1 hour' then 'last_hour'
                when created_at >= now() - interval '1 day' then 'last_day'
                when created_at >= now() - interval '7 day' then 'last_week'
                else 'older'
            end as bucket,
            count(*) as bucket_count
        from public.reports
        where status = 'open'
        group by 1
        order by 1
    ) s;

    raise notice 'housekeeping_ttl: open_report_buckets=%', report_buckets;
end;
$$;

grant execute on function public.housekeeping_ttl() to postgres;

select cron.unschedule('housekeeping-ttl');

select cron.schedule(
    'housekeeping-ttl',
    '0 * * * *',
    $$
        select public.housekeeping_ttl();
    $$
);
