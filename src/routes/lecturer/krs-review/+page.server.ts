import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { krs, krsDetail, kelasKuliah, mataKuliah, mahasiswa, users } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(303, '/login');
    }

    // Get the lecturer
    const lecturerResult = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (lecturerResult.length === 0 || lecturerResult[0].role !== 'LECTURER') {
        throw redirect(303, '/login');
    }
    const lecturer = lecturerResult[0];

    // Find all students mentored by this lecturer
    const mentoredStudents = await db.select({
        id: mahasiswa.id,
        nim: mahasiswa.nim,
        name: users.name,
        ipk: mahasiswa.ipk,
        semester: mahasiswa.semester
    })
    .from(mahasiswa)
    .innerJoin(users, eq(mahasiswa.userId, users.id))
    .where(eq(mahasiswa.pembimbingAkademikId, lecturer.id));

    const mentoredStudentIds = mentoredStudents.map(s => s.id);
    
    let submittedStudents: any[] = [];

    if (mentoredStudentIds.length > 0) {
        // Find their KRS
        const krsList = await db.select()
            .from(krs)
            .where(inArray(krs.mahasiswaId, mentoredStudentIds));

        for (const k of krsList) {
            if (k.status === 'DRAFT') continue; // Lecturer shouldn't see drafts usually, but the UI has REVISI which we mapped to DRAFT in DB? Wait, DRAFT is DRAFT. REVISI was DRAFT with note in mock. We'll map REVISI to DRAFT with rejectionReason.
            
            const student = mentoredStudents.find(s => s.id === k.mahasiswaId);
            
            // Get KRS Details (Courses)
            const details = await db.select({
                kode: mataKuliah.kode,
                nama: mataKuliah.nama,
                sks: mataKuliah.sks,
                jadwal: kelasKuliah.jadwal
            })
            .from(krsDetail)
            .innerJoin(mataKuliah, eq(krsDetail.courseId, mataKuliah.id))
            .innerJoin(kelasKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
            .where(eq(krsDetail.krsId, k.id));

            const totalSks = details.reduce((sum, d) => sum + d.sks, 0);

            // Determine UI status
            let displayStatus: string = k.status;
            if (k.status === 'DRAFT' && k.rejectionReason) {
                displayStatus = 'REVISI';
            }

            // We include DIAJUKAN, DISETUJUI, DITOLAK, and DRAFT with rejectionReason (REVISI)
            submittedStudents.push({
                nim: student?.nim,
                name: student?.name,
                ipk: parseFloat(student?.ipk as string),
                status: displayStatus,
                totalSks,
                courses: details,
                rejectionReason: k.rejectionReason
            });
        }
    }

    return {
        submittedStudents
    };
}

export const actions = {
    approve: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        
        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.nim, nim)).limit(1);
        if (mhsResult.length > 0) {
            const mhsId = mhsResult[0].id;
            const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhsId)).limit(1);
            if (activeKrs.length > 0) {
                await db.update(krs).set({ status: 'DISETUJUI', rejectionReason: null }).where(eq(krs.id, activeKrs[0].id));
            }
        }
        return { success: true };
    },

    reject: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        const reason = data.get('reason') as string;
        
        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.nim, nim)).limit(1);
        if (mhsResult.length > 0) {
            const mhsId = mhsResult[0].id;
            const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhsId)).limit(1);
            if (activeKrs.length > 0) {
                await db.update(krs).set({ status: 'DITOLAK', rejectionReason: reason }).where(eq(krs.id, activeKrs[0].id));
                
                // Return quota
                const details = await db.select().from(krsDetail).where(eq(krsDetail.krsId, activeKrs[0].id));
                for (const d of details) {
                    const kelasResult = await db.select().from(kelasKuliah).where(eq(kelasKuliah.mataKuliahId, d.courseId)).limit(1);
                    if (kelasResult.length > 0) {
                        await db.update(kelasKuliah).set({ sisaKuota: kelasResult[0].sisaKuota + 1 }).where(eq(kelasKuliah.id, kelasResult[0].id));
                    }
                }
            }
        }
        return { success: true };
    },

    returnForRevision: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        const note = data.get('note') as string;
        
        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.nim, nim)).limit(1);
        if (mhsResult.length > 0) {
            const mhsId = mhsResult[0].id;
            const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhsId)).limit(1);
            if (activeKrs.length > 0) {
                await db.update(krs).set({ status: 'DRAFT', rejectionReason: note }).where(eq(krs.id, activeKrs[0].id));
            }
        }
        return { success: true };
    }
};
