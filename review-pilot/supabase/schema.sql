-- Create a table for public user profiles
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  subscription_status text default 'free', -- 'free', 'pro'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Create a table for businesses
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users not null,
  business_name text not null,
  google_place_id text, -- Can be a simulated ID for MVP
  auto_reply_threshold integer default 4,
  ai_tone text default 'professional',
  business_context text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.businesses enable row level security;

-- Policies for businesses
create policy "Users can CRUD their own businesses" on public.businesses
  for all using (auth.uid() = user_id);

-- Create a table for reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses not null,
  reviewer_name text not null,
  star_rating integer not null check (star_rating >= 1 and star_rating <= 5),
  content text,
  reply_content text,
  status text default 'pending', -- 'pending', 'draft', 'applied' (replied) or just 'replied'
  posted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies for reviews
create policy "Users can view reviews for their businesses" on public.reviews
  for select using (
    exists (
      select 1 from public.businesses
      where public.businesses.id = public.reviews.business_id
      and public.businesses.user_id = auth.uid()
    )
  );

create policy "Users can update reviews (reply) for their businesses" on public.reviews
  for update using (
    exists (
      select 1 from public.businesses
      where public.businesses.id = public.reviews.business_id
      and public.businesses.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
