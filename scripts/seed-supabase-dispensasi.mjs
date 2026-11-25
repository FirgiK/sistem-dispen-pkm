import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Baca .env
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL atau Anon Key tidak ditemukan di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Menghubungkan ke Supabase:', supabaseUrl);

  const { DUMMY_DISPENSASI_LIST } = await import('../src/data/dummy-dispensasi.ts');
  console.log(`Menyiapkan ${DUMMY_DISPENSASI_LIST.length} data dummy dispensasi...`);

  const payload = DUMMY_DISPENSASI_LIST.map((item) => ({
    local_id: item.localId,
    nama_pengaju: item.namaPengaju,
    job_bagian: item.jobBagian,
    jenis_dispensasi: item.jenisDispensasi,
    sub_jenis_shift: item.subJenisShift || null,
    keterangan_izin_lainnya: item.keteranganIzinLainnya || null,
    tanggal_mulai: item.tanggalMulai,
    tanggal_selesai: item.tanggalSelesai,
    alasan: item.alasan,
    lampiran_url: item.lampiranUrl || null,
    status: item.status,
    alasan_penolakan: item.alasanPenolakan || null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }));

  // Batch insert per 25 items agar aman
  let inserted = 0;
  for (let i = 0; i < payload.length; i += 25) {
    const batch = payload.slice(i, i + 25);
    const { error } = await supabase
      .from('dispensasi')
      .upsert(batch, { onConflict: 'local_id' });

    if (error) {
      console.error(`Gagal batch ${i}-${i + batch.length}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Berhasil insert/upsert ${inserted}/${payload.length} data.`);
    }
  }

  console.log(`SELESAI! Total ${inserted} data dummy dispensasi berhasil masuk ke Supabase!`);
}

seed().catch(console.error);
