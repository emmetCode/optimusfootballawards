-- admin_bootstrap.sql
-- Creates the FIRST administrator. Run once, manually, in the Supabase SQL Editor.
--
-- Before running:
--   1. Authentication > Providers > Email: turn OFF "Allow new users to sign up".
--   2. Authentication > Users > "Add user": create your account (email + password).
--   3. Replace the email below with that exact address.
--
-- This cannot be triggered from the website: the admins table has no client write policy.

insert into public.admins (user_id)
select id
from auth.users
where email = 'acharya8ganesh@gmail.com'
on conflict (user_id) do nothing;

-- Verify: should return one row with your email.
select a.user_id, u.email
from public.admins a
join auth.users u on u.id = a.user_id;
