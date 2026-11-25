-- ============================================================
-- SKEMA TABEL DISPENSASI - UPTD PUSKESMAS CIPATUJAH
-- Jalankan file ini di Supabase SQL Editor
-- Timezone default: Asia/Jakarta (WIB / UTC+7)
-- ============================================================

-- 1. Atur Timezone Database ke WIB (Asia/Jakarta)
alter database postgres set timezone to 'Asia/Jakarta';

-- 2. Buat Tabel Dispensasi
create table if not exists public.dispensasi (
  id uuid primary key default gen_random_uuid(),
  local_id text unique, -- Unique ID untuk deduplikasi draft offline
  nama_pengaju text not null,
  job_bagian text not null,
  jenis_dispensasi text not null,
  sub_jenis_shift text,
  keterangan_izin_lainnya text,
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  alasan text not null,
  lampiran_url text,
  status text not null default 'Menunggu Persetujuan' check (
    status in (
      'Menunggu Persetujuan',
      'Sudah Diberikan di Sadasbor',
      'Ditolak',
      'Dibatalkan'
    )
  ),
  alasan_penolakan text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Indeks untuk Query Cepat
create index if not exists idx_dispensasi_status on public.dispensasi(status);
create index if not exists idx_dispensasi_tanggal_mulai on public.dispensasi(tanggal_mulai asc);
create index if not exists idx_dispensasi_created_at on public.dispensasi(created_at desc);

-- 4. Row Level Security (RLS)
alter table public.dispensasi enable row level security;

-- 5. Policies
create policy "Izinkan siapa saja mengirim pengajuan dispensasi"
  on public.dispensasi
  for insert
  to anon, authenticated
  with check (true);

create policy "Izinkan membaca pengajuan dispensasi"
  on public.dispensasi
  for select
  to anon, authenticated
  using (true);

create policy "Izinkan memperbarui status pengajuan dispensasi"
  on public.dispensasi
  for update
  to anon, authenticated
  using (true)
  with check (true);


-- ============================================================
-- 6. Storage Bucket untuk Lampiran Bukti Dispensasi
-- ============================================================
insert into storage.buckets (id, name, public)
values ('lampiran-dispensasi', 'lampiran-dispensasi', true)
on conflict (id) do nothing;

create policy "Izinkan upload lampiran dispensasi"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'lampiran-dispensasi');

create policy "Izinkan membaca lampiran dispensasi"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'lampiran-dispensasi');
