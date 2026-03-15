# Order Tracking Setup — YachtSignShop

## What was built

| File | Purpose |
|------|---------|
| `track.html` | Customer-facing tracking page |
| `admin.html` | Your private order management panel |
| `netlify/functions/track-order.js` | Looks up order by number + email |
| `netlify/functions/admin-order.js` | Creates/updates orders (admin-only) |

---

## Step 1 — Create Supabase project (5 min)

1. Go to **supabase.com** → New Project
2. Name it `yachtsignshop`, pick a region close to your customers
3. Once created, go to **SQL Editor** and run this:

```sql
create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  email text not null,
  customer_name text default '',
  sign_name text default '',
  material text default '',
  size text default '',
  status text default 'proof_pending',
  status_message text default '',
  proof_url text,
  tracking_number text,
  tracking_url text,
  estimated_ship_date date,
  history jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Allow public read via service key only (no anon access)
alter table orders enable row level security;
create policy "Service key full access" on orders using (true) with check (true);
```

4. Go to **Settings → API** and copy:
   - **Project URL** → this is your `SUPABASE_URL`
   - **service_role key** (not anon) → this is your `SUPABASE_SERVICE_KEY`

---

## Step 2 — Add environment variables in Netlify

Go to **Netlify → Site Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service_role key |
| `ADMIN_SECRET_KEY` | A strong password you choose (e.g. `yss-admin-2025-xK9m`) |

Redeploy after adding these.

---

## Step 3 — Deploy files

Add these to your repo:
- `track.html` → site root
- `admin.html` → site root  
- `netlify/functions/track-order.js`
- `netlify/functions/admin-order.js`
- Updated `index.html` (Track Order added to footer)

---

## How to use the admin panel

1. Go to `yourdomain.com/admin.html`
2. Enter your `ADMIN_SECRET_KEY` to log in
3. **New Order** — add an order as soon as it comes in
4. **Update** — change status at each production stage, paste proof URL or tracking number
5. **Preview** — opens the customer tracking view for that order

### Order number format
Recommend using: `YSS-00001`, `YSS-00002`, etc.  
Include this number in your order confirmation emails so customers can find it.

---

## Customer flow

1. Customer gets order confirmation email with their order number
2. They go to `yourdomain.com/track.html`
3. Enter order number + email → see full status timeline
4. If proof is ready, a **View Proof** button appears
5. If shipped, tracking number + carrier link appears

---

## Status progression

```
Order Received → Proof Sent → Design Approved → In Production → Quality Check → Shipped → Delivered
```
