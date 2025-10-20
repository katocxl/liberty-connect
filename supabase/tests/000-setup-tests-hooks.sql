\set ON_ERROR_STOP on

-- Ensure pgTAP is available for the test suite.
create extension if not exists pgtap;

-- Shared helpers for setting the JWT claims Supabase uses for RLS.
create schema if not exists tests;

create or replace function tests.set_authenticated_user(user_id uuid)
returns void
language plpgsql
as $$
begin
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    if user_id is null then
        perform set_config('request.jwt.claim.sub', '', true);
    else
        perform set_config('request.jwt.claim.sub', user_id::text, true);
    end if;
end;
$$;

create or replace function tests.clear_auth()
returns void
language plpgsql
as $$
begin
    perform set_config('request.jwt.claim.role', 'anon', true);
    perform set_config('request.jwt.claim.sub', '', true);
end;
$$;

select plan(2);
select has_schema('tests', 'tests helper schema exists');
select ok(true, 'test helpers installed');
select finish();
