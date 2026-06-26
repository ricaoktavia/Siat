import { db } from '$lib/server/db';
import { kelasKuliah, mataKuliah, presensi, mahasiswa, users } from '$lib/server/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) throw redirect(303, '/login');

    const lecturerRes = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (lecturerRes.length === 0) throw redirect(303, '/login');
    const lecturer = lecturerRes[0];

    // 1. Fetch Schedule
    const scheduleRaw = await db.select({
        id: kelasKuliah.id,
        mataKuliahId: mataKuliah.id,
        mk: mataKuliah.nama,
        waktu: kelasKuliah.jadwal,
        ruang: sql<string>`'Gedung A - R.201'`,
        kelas: sql<string>`'TI-A'`,
        mahasiswa: kelasKuliah.kuotaMaksimal, 
    })
    .from(kelasKuliah)
    .innerJoin(mataKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
    .where(eq(kelasKuliah.dosenUtama, lecturer.name));

    const teachingData: Record<string, any[]> = {
        'Senin': [], 'Selasa': [], 'Rabu': [], 'Kamis': [], 'Jumat': []
    };

    scheduleRaw.forEach(item => {
        const parts = item.waktu.split(',');
        const day = parts[0].trim();
        const time = parts[1] ? parts[1].trim() : item.waktu;
        if (teachingData[day]) {
            teachingData[day].push({ ...item, waktu: time });
        }
    });

    // 2. Fetch students and attendance
    const studentsRaw = await db.select({
        mahasiswaId: mahasiswa.id,
        nim: mahasiswa.nim,
        nama: users.name
    })
    .from(mahasiswa)
    .innerJoin(users, eq(mahasiswa.userId, users.id));

    let attendanceLogs: any[] = [];
    if (scheduleRaw.length > 0) {
        attendanceLogs = await db.select()
        .from(presensi)
        .where(inArray(presensi.mataKuliahId, scheduleRaw.map(s => s.mataKuliahId)));
    }

    const attendanceByClass: Record<number, any[]> = {};
    scheduleRaw.forEach(s => {
        attendanceByClass[s.id] = studentsRaw.map(st => {
            const isPresent = attendanceLogs.some(log => log.mataKuliahId === s.mataKuliahId && log.mahasiswaId === st.mahasiswaId && log.hadir > 0);
            return {
                id: st.mahasiswaId,
                name: st.nama,
                nim: st.nim,
                hadir: isPresent
            };
        });
    });

    return {
        teachingData,
        attendanceByClass
    };
}
