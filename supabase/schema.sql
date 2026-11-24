-- ============================================================
-- SKEMA TABEL DISPENSASI - UPTD PUSKESMAS CIPATUJAH
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

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
  status text not null default 'Menunggu Kapus' check (
    status in (
      'Menunggu Kapus',
      'Sudah Diberikan di Sadasbor',
      'Ditolak',
      'Dibatalkan'
    )
  ),
  alasan_penolakan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks untuk query cepat
create index if not exists idx_dispensasi_status on public.dispensasi(status);
create index if not exists idx_dispensasi_tanggal_mulai on public.dispensasi(tanggal_mulai asc);
create index if not exists idx_dispensasi_created_at on public.dispensasi(created_at desc);

-- Row Level Security (RLS)
alter table public.dispensasi enable row level security;

-- Policy untuk form publik (insert pengajuan tanpa login)
create policy "Izinkan siapa saja mengirim pengajuan dispensasi"
  on public.dispensasi
  for insert
  to anon, authenticated
  with check (true);

-- Policy untuk membaca pengajuan di dashboard
create policy "Izinkan membaca pengajuan dispensasi"
  on public.dispensasi
  for select
  to anon, authenticated
  using (true);

-- Policy untuk memperbarui status pengajuan (Kapus)
create policy "Izinkan memperbarui status pengajuan dispensasi"
  on public.dispensasi
  for update
  to anon, authenticated
  using (true)
  with check (true);
