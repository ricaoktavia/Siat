import { mysqlTable, varchar, int, decimal, mysqlEnum, text, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: varchar('id', { length: 50 }).primaryKey(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['STUDENT', 'LECTURER', 'ADMIN']).notNull(),
    name: varchar('name', { length: 100 }).notNull()
});

export const mahasiswa = mysqlTable('mahasiswa', {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('user_id', { length: 50 }).notNull().references(() => users.id),
    nim: varchar('nim', { length: 20 }).notNull().unique(),
    prodi: varchar('prodi', { length: 50 }).notNull(),
    ipk: decimal('ipk', { precision: 3, scale: 2 }).default('0.00'),
    semester: int('semester').default(1),
    pembimbingAkademikId: varchar('pembimbing_akademik_id', { length: 50 })
});

export const mataKuliah = mysqlTable('mata_kuliah', {
    id: varchar('id', { length: 50 }).primaryKey(),
    kode: varchar('kode', { length: 10 }).notNull().unique(),
    nama: varchar('nama', { length: 100 }).notNull(),
    sks: int('sks').notNull()
});

export const kelasKuliah = mysqlTable('kelas_kuliah', {
    id: int('id').autoincrement().primaryKey(),
    mataKuliahId: varchar('mata_kuliah_id', { length: 50 }).notNull().references(() => mataKuliah.id),
    dosenUtama: varchar('dosen_utama', { length: 100 }).notNull(),
    jadwal: varchar('jadwal', { length: 50 }).notNull(),
    kuotaMaksimal: int('kuota_maksimal').notNull(),
    sisaKuota: int('sisa_kuota').notNull(),
    dosenUserId: varchar('dosen_user_id', { length: 50 }).references(() => users.id)
});

export const presensiLog = mysqlTable('presensi_log', {
    id: int('id').autoincrement().primaryKey(),
    kelasKuliahId: int('kelas_kuliah_id').notNull().references(() => kelasKuliah.id),
    mahasiswaId: int('mahasiswa_id').notNull().references(() => mahasiswa.id),
    waktu: timestamp('waktu').defaultNow().notNull()
});
