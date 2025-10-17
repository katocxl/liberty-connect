-- 040_search_fts.sql
-- Full-text search vectors and indexes

alter table public.announcements
    add column if not exists search_vector tsvector;

update public.announcements
set search_vector = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''));

drop index if exists announcements_search_vector_idx;
create index announcements_search_vector_idx
    on public.announcements
    using gin (search_vector);

drop trigger if exists announcements_search_vector_tg on public.announcements;
create trigger announcements_search_vector_tg
before insert or update on public.announcements
for each row execute function tsvector_update_trigger('search_vector', 'pg_catalog.english', 'title', 'body');

alter table public.prayers
    add column if not exists search_vector tsvector;

update public.prayers
set search_vector = to_tsvector('english', coalesce(body, ''));

drop index if exists prayers_search_vector_idx;
create index prayers_search_vector_idx
    on public.prayers
    using gin (search_vector);

drop trigger if exists prayers_search_vector_tg on public.prayers;
create trigger prayers_search_vector_tg
before insert or update on public.prayers
for each row execute function tsvector_update_trigger('search_vector', 'pg_catalog.english', 'body');
