import { db } from '$lib/server/db';
import { krs, krsDetail, mataKuliah, kelasKuliah, mahasiswa, users, grades, logAudit } from '$lib/server/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';

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

    // 1. Get courses taught by this lecturer
    const myClasses = await db.select({
        id: mataKuliah.id,
        kode: mataKuliah.kode,
        nama: mataKuliah.nama,
        kelasId: kelasKuliah.id
    })
    .from(kelasKuliah)
    .innerJoin(mataKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
    .where(eq(kelasKuliah.dosenUtama, lecturer.name));

    const courseIds = myClasses.map(c => c.id);

    let gradesWithStudents: any[] = [];
    let auditLogs: any[] = [];

    if (courseIds.length > 0) {
        // 2. Find students taking these courses with approved KRS
        const enrolledStudents = await db.select({
            krsId: krs.id,
            mahasiswaId: mahasiswa.id,
            nim: mahasiswa.nim,
            name: users.name,
            courseId: krsDetail.courseId
        })
        .from(krsDetail)
        .innerJoin(krs, eq(krsDetail.krsId, krs.id))
        .innerJoin(mahasiswa, eq(krs.mahasiswaId, mahasiswa.id))
        .innerJoin(users, eq(mahasiswa.userId, users.id))
        .where(
            and(
                eq(krs.status, 'DISETUJUI'),
                inArray(krsDetail.courseId, courseIds)
            )
        );

        // 3. Get existing grades for these students
        const mhsIds = enrolledStudents.map(s => s.mahasiswaId);
        let existingGrades: any[] = [];
        if (mhsIds.length > 0) {
            existingGrades = await db.select().from(grades).where(inArray(grades.mahasiswaId, mhsIds));
        }

        gradesWithStudents = enrolledStudents.map(student => {
            const gradeRecord = existingGrades.find(g => g.mahasiswaId === student.mahasiswaId && g.mataKuliahId === student.courseId);
            return {
                mahasiswaId: student.mahasiswaId,
                nim: student.nim,
                studentName: student.name,
                courseId: student.courseId,
                uts: parseFloat((gradeRecord?.uts as string) || '0'),
                uas: parseFloat((gradeRecord?.uas as string) || '0'),
                final: parseFloat((gradeRecord?.final as string) || '0'),
                status: gradeRecord?.status || 'DRAFT'
            };
        });

        // Get logs for lecturer
        auditLogs = await db.select().from(logAudit).where(eq(logAudit.user, lecturer.name)).orderBy(desc(logAudit.timestamp)).limit(20);
    }

    return {
        courses: myClasses,
        grades: gradesWithStudents,
        logs: auditLogs.map(l => ({
            id: l.id,
            timestamp: new Date(l.timestamp).toISOString().replace('T', ' ').slice(0, 16),
            user: l.user,
            action: l.action,
            detail: l.detail
        }))
    };
}

export const actions = {
    updateGrade: async ({ request, cookies }) => {
        const sessionId = cookies.get('session');
        const lecturerResult = await db.select().from(users).where(eq(users.id, sessionId as string)).limit(1);
        const lecturerName = lecturerResult[0]?.name || 'Unknown';

        const data = await request.formData();
        const nim = data.get('nim') as string;
        const courseId = data.get('courseId') as string;
        const uts = parseFloat(data.get('uts') as string) || 0;
        const uas = parseFloat(data.get('uas') as string) || 0;
        const isFinalize = data.get('finalize') === 'true';

        // Find student ID
        const studentResult = await db.select().from(mahasiswa).where(eq(mahasiswa.nim, nim)).limit(1);
        if (studentResult.length === 0) return fail(404, { error: true, message: 'Mahasiswa tidak ditemukan' });
        const mhsId = studentResult[0].id;

        const gradeResult = await db.select().from(grades).where(and(eq(grades.mahasiswaId, mhsId), eq(grades.mataKuliahId, courseId))).limit(1);
        
        let finalGrade = 0;
        let newStatus = 'DRAFT';

        if (isFinalize) {
            finalGrade = parseFloat(((uts * 0.4) + (uas * 0.6)).toFixed(2));
            newStatus = 'FINAL';
        }

        if (gradeResult.length > 0) {
            const currentGrade = gradeResult[0];
            if (currentGrade.status === 'FINAL') {
                return fail(400, { error: true, message: 'Nilai sudah dikunci dan tidak bisa diubah.' });
            }
            await db.update(grades)
                .set({ uts: uts.toString(), uas: uas.toString(), final: finalGrade.toString(), status: newStatus as any, updatedBy: lecturerName, updatedAt: new Date() })
                .where(eq(grades.id, currentGrade.id));
        } else {
            await db.insert(grades).values({
                mahasiswaId: mhsId,
                mataKuliahId: courseId,
                uts: uts.toString(),
                uas: uas.toString(),
                final: finalGrade.toString(),
                status: newStatus as any,
                updatedBy: lecturerName,
                updatedAt: new Date()
            });
        }

        // Audit Log
        await db.insert(logAudit).values({
            id: 'log_' + Date.now(),
            timestamp: new Date(),
            user: lecturerName,
            action: isFinalize ? 'FINALIZE_GRADE' : 'UPDATE_GRADE',
            detail: isFinalize 
                ? `Mengunci nilai Akhir mahasiswa ${nim} (MK ID: ${courseId})` 
                : `Update draft UTS/UAS mahasiswa ${nim} (MK ID: ${courseId})`
        });

        return { success: true, message: isFinalize ? 'Nilai berhasil dikunci!' : 'Draft nilai disimpan.' };
    },

    unlockGrade: async ({ request, cookies }) => {
        const sessionId = cookies.get('session');
        const lecturerResult = await db.select().from(users).where(eq(users.id, sessionId as string)).limit(1);
        const lecturerName = lecturerResult[0]?.name || 'Unknown';

        const data = await request.formData();
        const nim = data.get('nim') as string;
        const courseId = data.get('courseId') as string;

        const studentResult = await db.select().from(mahasiswa).where(eq(mahasiswa.nim, nim)).limit(1);
        if (studentResult.length > 0) {
            const mhsId = studentResult[0].id;
            await db.update(grades)
                .set({ status: 'DRAFT', updatedBy: lecturerName, updatedAt: new Date() })
                .where(and(eq(grades.mahasiswaId, mhsId), eq(grades.mataKuliahId, courseId)));

            await db.insert(logAudit).values({
                id: 'log_' + Date.now(),
                timestamp: new Date(),
                user: lecturerName,
                action: 'UNLOCK_GRADE',
                detail: `Membuka kunci nilai mahasiswa ${nim} (MK ID: ${courseId})`
            });
        }
        
        return { success: true, message: 'Nilai berhasil dibuka kembali.' };
    }
};
