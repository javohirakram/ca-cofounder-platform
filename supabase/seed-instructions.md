# Seed Data Instructions

This guide explains how to populate the Central Asian Co-Founder Platform database with realistic test data.

## Files

| File | Description |
|------|-------------|
| `supabase/seed.sql` | SQL INSERT statements for accelerators, profiles, ideas, and accelerator memberships |

## What Gets Seeded

- **4 accelerators**: Astana Hub (KZ), IT Park Uzbekistan (UZ), MOST Tech Hub (KG), UTECH (TJ)
- **20 founder profiles** across all five Central Asian countries:
  - 5 from Kazakhstan (Almaty: 3, Astana: 2)
  - 5 from Uzbekistan (Tashkent: 3, Samarkand: 2)
  - 4 from Kyrgyzstan (Bishkek: 3, Osh: 1)
  - 3 from Tajikistan (Dushanbe: 2, Khujand: 1)
  - 3 from Turkmenistan (Ashgabat: 2, Mary: 1)
- **5 startup ideas** spanning Fintech, Edtech, Cleantech, Tourism marketplace, and Logistics
- **17 accelerator memberships** linking founders to their respective hubs

## Seeding Approaches

### Approach A: Full Seed with Auth Users (Recommended for Local Dev)

This approach creates both `auth.users` and `public.profiles` in one go.

1. Open `supabase/seed.sql`
2. **Uncomment** the `auth.users` INSERT block near the top (between the `/*` and `*/` markers)
3. Run the entire file in the Supabase SQL Editor using the **postgres** or **service_role** connection
4. All 20 test users will be created with the password `Password123!`

```
Email pattern: <firstname>.<lastname>@test.com
Password:     Password123!
```

### Approach B: Create Users Through the App First

Use this when you want real auth sessions (e.g., for testing login flows).

1. Register 20 users through the app's sign-up page or via the Supabase Auth Dashboard
2. Copy each user's UUID from the Supabase Dashboard (Authentication > Users)
3. In `supabase/seed.sql`, find-and-replace the placeholder UUIDs:

   | Placeholder UUID | Profile |
   |-----------------|---------|
   | `00000000-0000-0000-0000-000000000001` | Aibek Nurlanuly (KZ, Almaty) |
   | `00000000-0000-0000-0000-000000000002` | Dana Suleimenova (KZ, Almaty) |
   | `00000000-0000-0000-0000-000000000003` | Timur Kasymov (KZ, Almaty) |
   | `00000000-0000-0000-0000-000000000004` | Madina Abenova (KZ, Astana) |
   | `00000000-0000-0000-0000-000000000005` | Yerbol Sakenov (KZ, Astana) |
   | `00000000-0000-0000-0000-000000000006` | Sardor Abdullaev (UZ, Tashkent) |
   | `00000000-0000-0000-0000-000000000007` | Nodira Karimova (UZ, Tashkent) |
   | `00000000-0000-0000-0000-000000000008` | Jasur Toshmatov (UZ, Tashkent) |
   | `00000000-0000-0000-0000-000000000009` | Dilnoza Rakhimova (UZ, Samarkand) |
   | `00000000-0000-0000-0000-000000000010` | Sherzod Mirzaev (UZ, Samarkand) |
   | `00000000-0000-0000-0000-000000000011` | Aizada Turgunova (KG, Bishkek) |
   | `00000000-0000-0000-0000-000000000012` | Bakyt Asanov (KG, Bishkek) |
   | `00000000-0000-0000-0000-000000000013` | Nuraiym Ibraimova (KG, Bishkek) |
   | `00000000-0000-0000-0000-000000000014` | Azamat Toktogulov (KG, Osh) |
   | `00000000-0000-0000-0000-000000000015` | Firdavs Rahimov (TJ, Dushanbe) |
   | `00000000-0000-0000-0000-000000000016` | Sitora Nazarova (TJ, Dushanbe) |
   | `00000000-0000-0000-0000-000000000017` | Komron Sharipov (TJ, Khujand) |
   | `00000000-0000-0000-0000-000000000018` | Merdan Orazov (TM, Ashgabat) |
   | `00000000-0000-0000-0000-000000000019` | Aylar Berdiyeva (TM, Ashgabat) |
   | `00000000-0000-0000-0000-000000000020` | Dovlet Annayev (TM, Mary) |

4. Run the SQL (without the auth.users block) in the Supabase SQL Editor

### Approach C: FK Bypass (Quick and Dirty)

For rapid local testing when you do not need working auth sessions.

1. Temporarily drop the foreign key constraint:
   ```sql
   ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
   ```
2. Run the seed SQL (without the auth.users block)
3. Re-enable the constraint when done, or leave it off for local dev:
   ```sql
   ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey
     FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
   ```

## Running the Seed

### Via Supabase Dashboard

1. Go to **SQL Editor** in your Supabase project dashboard
2. Paste the contents of `seed.sql`
3. Click **Run**

### Via CLI

```bash
# If using psql directly (replace with your connection string)
psql "$DATABASE_URL" -f supabase/seed.sql

# If using Supabase CLI and seed.sql is configured
supabase db reset
```

### Via Supabase CLI Config

Add to your `supabase/config.toml`:

```toml
[db]
seed_file = "supabase/seed.sql"
```

Then `supabase db reset` will automatically run the seed after migrations.

## Verifying the Seed

After running the seed, verify with these queries:

```sql
-- Count all seeded data
SELECT 'accelerators' AS table_name, count(*) FROM public.accelerators
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
UNION ALL SELECT 'ideas', count(*) FROM public.ideas
UNION ALL SELECT 'accelerator_members', count(*) FROM public.accelerator_members;

-- Check country distribution
SELECT country, count(*) FROM public.profiles GROUP BY country ORDER BY count(*) DESC;

-- Check role distribution
SELECT unnest(role) AS role, count(*) FROM public.profiles GROUP BY 1 ORDER BY 2 DESC;

-- Check ideas
SELECT title, stage, industries FROM public.ideas;
```

Expected counts:
- accelerators: 4
- profiles: 20
- ideas: 5
- accelerator_members: 17

## Cleaning Up Seed Data

To remove all seed data:

```sql
-- Delete in reverse dependency order
DELETE FROM public.accelerator_members WHERE accelerator_id LIKE 'a0000000%';
DELETE FROM public.ideas WHERE id LIKE 'i0000000%';
DELETE FROM public.profiles WHERE id LIKE '00000000%';
DELETE FROM public.accelerators WHERE id LIKE 'a0000000%';

-- If you created auth.users stubs:
-- DELETE FROM auth.users WHERE id LIKE '00000000%';
```

## Notes

- All profile UUIDs follow the pattern `00000000-0000-0000-0000-0000000000XX` (01 through 20)
- Accelerator UUIDs follow the pattern `a0000000-0000-0000-0000-0000000000XX` (01 through 04)
- Idea UUIDs follow the pattern `i0000000-0000-0000-0000-0000000000XX` (01 through 05)
- Country codes use the format from the app's form component: `KZ`, `UZ`, `KG`, `TJ`, `TM`
- The `ON CONFLICT ... DO UPDATE` clauses make the seed idempotent (safe to run multiple times)
- Test user password for Approach A is `Password123!` for all accounts
