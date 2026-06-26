import { mysqlTable, varchar, int, decimal, mysqlEnum, text, datetime } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: varchar('id', { length: 50 }).primaryKey(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['STUDENT', 'LECTURER', 'ADMIN']).notNull(),
    name: varchar('name', { length: 100 }).notNull()
});

export const mahasiswa = mysqlTable('mahasiswa', {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('user_id', { length: 50 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    nim: varchar('nim', { length: 20 }).notNull().unique(),
    prodi: varchar('prodi', { length: 50 }).notNull(),
    ipk: decimal('ipk', { precision: 3, scale: 2 }).default('0.00').notNull(),
    semester: int('semester').default(1).notNull(),
    pembimbingAkademikId: varchar('pembimbing_akademik_id', { length: 50 }),
    nik: varchar('nik', { length: 20 }),
    tempatLahir: varchar('tempat_lahir', { length: 50 }),
    tanggalLahir: varchar('tanggal_lahir', { length: 50 }),
    jenisKelamin: varchar('jenis_kelamin', { length: 20 }),
    agama: varchar('agama', { length: 20 }),
    kewarganegaraan: varchar('kewarganegaraan', { length: 20 }),
    golonganDarah: varchar('golongan_darah', { length: 5 }),
    email: varchar('email', { length: 100 }),
    emailPribadi: varchar('email_pribadi', { length: 100 }),
    noHp: varchar('no_hp', { length: 20 }),
    alamatAsal: text('alamat_asal'),
    alamatDomisili: text('alamat_domisili'),
    namaAyah: varchar('nama_ayah', { length: 100 }),
    pekerjaanAyah: varchar('pekerjaan_ayah', { length: 100 }),
    namaIbu: varchar('nama_ibu', { length: 100 }),
    pekerjaanIbu: varchar('pekerjaan_ibu', { length: 100 }),
    noTeleponDarurat: varchar('no_telepon_darurat', { length: 20 })
});

export const mataKuliah = mysqlTable('mata_kuliah', {
    id: varchar('id', { length: 50 }).primaryKey(),
    kode: varchar('kode', { length: 10 }).notNull().unique(),
    nama: varchar('nama', { length: 100 }).notNull(),
    sks: int('sks').notNull()
});

export const mataKuliahPrasyarat = mysqlTable('mata_kuliah_prasyarat', {
    id: int('id').autoincrement().primaryKey(),
    mataKuliahId: varchar('mata_kuliah_id', { length: 50 }).notNull().references(() => mataKuliah.id, { onDelete: 'cascade' }),
    prasyaratKode: varchar('prasyarat_kode', { length: 10 }).notNull()
});

export const kelasKuliah = mysqlTable('kelas_kuliah', {
    id: int('id').autoincrement().primaryKey(),
    mataKuliahId: varchar('mata_kuliah_id', { length: 50 }).notNull().references(() => mataKuliah.id, { onDelete: 'cascade' }),
    dosenUtama: varchar('dosen_utama', { length: 100 }).notNull(),
    jadwal: varchar('jadwal', { length: 50 }).notNull(),
    kuotaMaksimal: int('kuota_maksimal').notNull(),
    sisaKuota: int('sisa_kuota').notNull()
});

export const krs = mysqlTable('krs', {
    id: int('id').autoincrement().primaryKey(),
    mahasiswaId: int('mahasiswa_id').notNull().references(() => mahasiswa.id, { onDelete: 'cascade' }),
    periodeAkademik: varchar('periode_akademik', { length: 20 }).notNull(),
    status: mysqlEnum('status', ['DRAFT', 'DIAJUKAN', 'DISETUJUI', 'DITOLAK']).default('DRAFT').notNull(),
    rejectionReason: text('rejection_reason')
});

export const krsDetail = mysqlTable('krs_detail', {
    id: int('id').autoincrement().primaryKey(),
    krsId: int('krs_id').notNull().references(() => krs.id, { onDelete: 'cascade' }),
    courseId: varchar('course_id', { length: 50 }).notNull().references(() => mataKuliah.id, { onDelete: 'cascade' })
});

export const uktKeuangan = mysqlTable('ukt_keuangan', {
    id: int('id').autoincrement().primaryKey(),
    mahasiswaId: int('mahasiswa_id').notNull().references(() => mahasiswa.id, { onDelete: 'cascade' }),
    semester: varchar('semester', { length: 20 }).notNull(),
    jumlah: decimal('jumlah', { precision: 15, scale: 2 }).notNull(),
    deadline: varchar('deadline', { length: 50 }).notNull(),
    virtualAccount: varchar('virtual_account', { length: 30 }).notNull(),
    status: mysqlEnum('status', ['BELUM_BAYAR', 'LUNAS']).default('BELUM_BAYAR').notNull()
});

export const presensi = mysqlTable('presensi', {
    id: int('id').autoincrement().primaryKey(),
    mahasiswaId: int('mahasiswa_id').notNull().references(() => mahasiswa.id, { onDelete: 'cascade' }),
    mataKuliahId: varchar('mata_kuliah_id', { length: 50 }).notNull().references(() => mataKuliah.id, { onDelete: 'cascade' }),
    hadir: int('hadir').default(0).notNull(),
    totalPertemuan: int('total_pertemuan').default(14).notNull()
});

export const grades = mysqlTable('grades', {
    id: int('id').autoincrement().primaryKey(),
    mahasiswaId: int('mahasiswa_id').notNull().references(() => mahasiswa.id, { onDelete: 'cascade' }),
    mataKuliahId: varchar('mata_kuliah_id', { length: 50 }).notNull().references(() => mataKuliah.id, { onDelete: 'cascade' }),
    uts: decimal('uts', { precision: 5, scale: 2 }),
    uas: decimal('uas', { precision: 5, scale: 2 }),
    final: decimal('final', { precision: 5, scale: 2 }),
    status: mysqlEnum('status', ['DRAFT', 'FINAL']).default('DRAFT').notNull(),
    updatedBy: varchar('updated_by', { length: 100 }),
    updatedAt: datetime('updated_at')
});

export const logAudit = mysqlTable('log_audit', {
    id: varchar('id', { length: 50 }).primaryKey(),
    timestamp: datetime('timestamp').notNull(),
    user: varchar('user', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    detail: text('detail').notNull()
});
