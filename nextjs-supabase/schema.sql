-- =====================================================
-- TRANG SÁCH - Supabase Schema
-- Chạy file này trong Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. PROFILES (mở rộng auth.users của Supabase)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  class_name text,
  role text default 'student' check (role in ('student', 'ctv', 'admin')),
  bio text,
  avatar_url text,
  xp int default 0,
  level int default 1,
  streak int default 0,
  last_checkin timestamptz,
  created_at timestamptz default now()
);

-- 2. BOOKS
create table if not exists books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  category text not null check (category in ('literature', 'skills', 'history', 'children')),
  summary text not null check (char_length(summary) >= 200),
  excerpt text,
  cover_color text default '#1F3A2D',
  cover_image text,
  legal_links jsonb default '[]'::jsonb,
  tags text[] default array[]::text[],
  featured boolean default false,
  read_count int default 0,
  rating_avg numeric(2,1) default 0,
  rating_count int default 0,
  added_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index if not exists books_category_idx on books(category);
create index if not exists books_featured_idx on books(featured) where featured = true;

-- 3. REVIEWS
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references books(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null check (char_length(content) >= 100),
  rating int check (rating >= 1 and rating <= 5) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_note text,
  featured boolean default false,
  created_at timestamptz default now()
);

create index if not exists reviews_book_idx on reviews(book_id);
create index if not exists reviews_author_idx on reviews(author_id);
create index if not exists reviews_status_idx on reviews(status);

-- 4. REACTIONS
create table if not exists reactions (
  review_id uuid references reviews(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  type text check (type in ('inspired', 'moved', 'thoughtful', 'fun')) not null,
  created_at timestamptz default now(),
  primary key (review_id, user_id, type)
);

-- 5. COMMENTS
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references reviews(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 2 and 500),
  created_at timestamptz default now()
);

-- 6. BOOKMARKS
create table if not exists bookmarks (
  user_id uuid references profiles(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, book_id)
);

-- 7. BADGES
create table if not exists badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  earned_at timestamptz default now(),
  unique (user_id, name)
);

-- =====================================================
-- TRIGGER: tự tạo profile khi user đăng ký
-- =====================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, class_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Học sinh mới'),
    new.raw_user_meta_data->>'class_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
alter table profiles enable row level security;
alter table books enable row level security;
alter table reviews enable row level security;
alter table reactions enable row level security;
alter table comments enable row level security;
alter table bookmarks enable row level security;
alter table badges enable row level security;

-- PROFILES: ai cũng xem được, chỉ chủ sở hữu sửa được
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- BOOKS: ai cũng xem được, chỉ ctv/admin tạo/sửa/xóa
create policy "books_select_all" on books for select using (true);
create policy "books_insert_staff" on books for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('ctv', 'admin'))
);
create policy "books_update_staff" on books for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ctv', 'admin'))
);
create policy "books_delete_admin" on books for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- REVIEWS: chỉ thấy bài đã duyệt (trừ bài của chính mình / staff)
create policy "reviews_select_approved_or_own" on reviews for select using (
  status = 'approved'
  or author_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ctv', 'admin'))
);
create policy "reviews_insert_own" on reviews for insert with check (auth.uid() = author_id);
create policy "reviews_update_own_or_staff" on reviews for update using (
  auth.uid() = author_id
  or exists (select 1 from profiles where id = auth.uid() and role in ('ctv', 'admin'))
);
create policy "reviews_delete_own_or_admin" on reviews for delete using (
  auth.uid() = author_id
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- REACTIONS: ai cũng xem, chỉ mình quản lý reaction của mình
create policy "reactions_select_all" on reactions for select using (true);
create policy "reactions_insert_own" on reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete_own" on reactions for delete using (auth.uid() = user_id);

-- COMMENTS
create policy "comments_select_all" on comments for select using (true);
create policy "comments_insert_own" on comments for insert with check (auth.uid() = author_id);
create policy "comments_delete_own_or_admin" on comments for delete using (
  auth.uid() = author_id
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- BOOKMARKS: chỉ chủ sở hữu
create policy "bookmarks_own" on bookmarks for all using (auth.uid() = user_id);

-- BADGES
create policy "badges_select_all" on badges for select using (true);

-- =====================================================
-- SEED DATA
-- =====================================================
insert into books (title, author, category, summary, cover_color, featured) values
('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'literature',
 'Dế Mèn Phiêu Lưu Ký là câu chuyện về chú dế trẻ tuổi kiêu ngạo, tự mãn, từng gây ra cái chết của Dế Choắt hàng xóm. Sau bi kịch ấy, Dế Mèn quyết định lên đường phiêu lưu, kết bạn với Dế Trũi, gặp gỡ nhiều loài vật, trải qua đủ thử thách. Qua mỗi chuyến đi, Dế Mèn trưởng thành hơn, biết thương yêu đồng loại và mơ về một thế giới hòa bình.',
 '#1F3A2D', true),
('Nhật Ký Đặng Thùy Trâm', 'Đặng Thùy Trâm', 'history',
 'Cuốn nhật ký được tìm thấy hơn 30 năm sau khi bác sĩ Đặng Thùy Trâm hy sinh tại chiến trường Quảng Ngãi năm 1970, khi chị mới 27 tuổi. Những trang nhật ký ghi lại cuộc sống của một nữ bác sĩ trẻ giữa bom đạn: công việc cứu chữa thương binh, tình yêu tuổi trẻ dang dở, nỗi nhớ gia đình, và niềm tin mãnh liệt vào lý tưởng.',
 '#6B1F1F', true),
('Hoàng Tử Bé', 'Antoine de Saint-Exupéry', 'children',
 'Hoàng Tử Bé kể về cuộc gặp gỡ giữa một phi công bị rơi máy bay giữa sa mạc Sahara và một cậu bé đến từ tiểu hành tinh B-612. Qua những câu chuyện mà Hoàng Tử Bé kể về hành trình của mình, cuốn sách trở thành một ẩn dụ sâu sắc về tình yêu, sự mất mát, và cách người lớn đánh mất trí tưởng tượng.',
 '#1E3A5F', false),
('Đắc Nhân Tâm', 'Dale Carnegie', 'skills',
 'Đắc Nhân Tâm đúc kết những nguyên tắc cốt lõi để chinh phục lòng người: tránh phê phán gay gắt, thành thật khen ngợi, quan tâm đến người khác, luôn mỉm cười, ghi nhớ tên người, lắng nghe để người khác cảm thấy quan trọng. Cuốn sách minh họa bằng vô số câu chuyện thực tế từ lịch sử và đời thường.',
 '#2D3748', false),
('Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Nguyễn Nhật Ánh', 'literature',
 'Qua lời kể của nhân vật cu Mùi, Nguyễn Nhật Ánh đưa người đọc trở về với tuổi thơ trong trẻo của lứa trẻ em những năm 70-80. Mỗi chương là một lát cắt đáng yêu và cười ra nước mắt. Cuốn sách nhắc nhở chúng ta nâng niu những khoảnh khắc hồn nhiên nhất của đời mình.',
 '#8B6914', false),
('Tuổi Thơ Dữ Dội', 'Phùng Quán', 'history',
 'Tuổi Thơ Dữ Dội tái hiện cuộc đời của những em thiếu niên trinh sát trong đội Vệ Quốc Đoàn ở chiến trường Bình Trị Thiên thời kháng chiến chống Pháp. Các nhân vật là những cậu bé mười ba, mười bốn tuổi nhưng đã dấn thân vào cuộc chiến với tất cả tinh thần trong sáng và quyết liệt.',
 '#44403c', false)
on conflict do nothing;
