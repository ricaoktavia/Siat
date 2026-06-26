import { db } from '$lib/server/db';
import { krs, krsDetail, mataKuliah, mahasiswa, users, kelasKuliah } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(303, '/login');
    }

    const lecturerResult = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (lecturerResult.length === 0 || lecturerResult[0].role !== 'LECTURER') {
        throw redirect(303, '/login');
    }
    const lecturer = lecturerResult[0];

    // Find all mentored students
    const mentoredStudents = await db.select({
        id: mahasiswa.id,
        nim: mahasiswa.nim,
        name: users.name,
        prodi: mahasiswa.prodi
    })
    .from(mahasiswa)
    .innerJoin(users, eq(mahasiswa.userId, users.id))
    .where(eq(mahasiswa.pembimbingAkademikId, lecturer.id));

    const mentoredStudentIds = mentoredStudents.map(s => s.id);
    
    let pendingKrs: any[] = [];

    if (mentoredStudentIds.length > 0) {
        const krsList = await db.select()
            .from(krs)
            .where(inArray(krs.mahasiswaId, mentoredStudentIds));

        for (const k of krsList) {
            if (k.status === 'DIAJUKAN') {
                const student = mentoredStudents.find(s => s.id === k.mahasiswaId);
                
                const details = await db.select({
                    sks: mataKuliah.sks,
                })
                .from(krsDetail)
                .innerJoin(mataKuliah, eq(krsDetail.courseId, mataKuliah.id))
                .where(eq(krsDetail.krsId, k.id));

                const totalSks = details.reduce((sum, d) => sum + d.sks, 0);

                pendingKrs.push({
                    nim: student?.nim,
                    name: student?.name,
                    prodi: student?.prodi,
                    totalSks
                });
            }
        }
    }

    const myClasses = await db.select({
        id: kelasKuliah.id,
        waktu: kelasKuliah.jadwal,
        mk: mataKuliah.nama
    })
    .from(kelasKuliah)
    .innerJoin(mataKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
    .where(eq(kelasKuliah.dosenUtama, lecturer.name));

    return {
        pendingKrs,
        totalStudents: mentoredStudentIds.length,
        pendingKrsCount: pendingKrs.length,
        totalCourses: myClasses.length,
        myClasses
    };
}
