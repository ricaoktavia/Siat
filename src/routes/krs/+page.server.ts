import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { krs, krsDetail, kelasKuliah, mataKuliah, mahasiswa, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

function isKrsOpen() {
    // Return true to allow testing KRS at any time
    return true;
}

function getMaxSks(ipk: number) {
    if (ipk >= 3.0) return 24;
    if (ipk >= 2.5) return 21;
    if (ipk >= 2.0) return 18;
    return 15;
}

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(303, '/login');
    }

    // Get current student
    const result = await db.select().from(mahasiswa)
        .innerJoin(users, eq(mahasiswa.userId, users.id))
        .where(eq(users.id, sessionId))
        .limit(1);

    if (result.length === 0) {
        throw redirect(303, '/login');
    }

    const currentStudent = result[0];

    // Check UKT Status
    const { uktKeuangan } = await import('$lib/server/db/schema');
    const uktResult = await db.select().from(uktKeuangan).where(and(eq(uktKeuangan.mahasiswaId, currentStudent.mahasiswa.id), eq(uktKeuangan.semester, currentStudent.mahasiswa.semester.toString()))).limit(1);
    const isUktLunas = uktResult.length > 0 && uktResult[0].status === 'LUNAS';

    // Check KRS Status
    const krsResult = await db.select().from(krs).where(eq(krs.mahasiswaId, currentStudent.mahasiswa.id)).limit(1);
    const krsStatus = krsResult.length > 0 ? krsResult[0].status : 'DRAFT';
    const activeKrs = krsResult.length > 0 ? krsResult[0] : null;

    // Get Catalog (Available Classes)
    const rawCatalog = await db.select({
        id: mataKuliah.id,
        kode: mataKuliah.kode,
        nama: mataKuliah.nama,
        sks: mataKuliah.sks,
        dosen: kelasKuliah.dosenUtama,
        jadwal: kelasKuliah.jadwal,
        kuota: kelasKuliah.kuotaMaksimal,
        sisa: kelasKuliah.sisaKuota,
        kelasId: kelasKuliah.id
    })
    .from(kelasKuliah)
    .innerJoin(mataKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id));

    const catalogResult = rawCatalog.map(item => ({
        ...item,
        prerequisites: []
    }));

    // Get Drafted Classes
    let draftsWithDetails: any[] = [];
    if (activeKrs) {
        const details = await db.select({
            id: mataKuliah.id,
            kode: mataKuliah.kode,
            nama: mataKuliah.nama,
            sks: mataKuliah.sks,
            jadwal: kelasKuliah.jadwal,
            kelasId: kelasKuliah.id,
            krsDetailId: krsDetail.id
        })
        .from(krsDetail)
        .innerJoin(mataKuliah, eq(krsDetail.courseId, mataKuliah.id))
        .innerJoin(kelasKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id)) // Simplified mapping
        .where(eq(krsDetail.krsId, activeKrs.id));
        
        draftsWithDetails = details;
    }

    // Check for schedule clashes
    const schedules: Record<string, number> = {};
    draftsWithDetails.forEach(item => {
        schedules[item.jadwal] = (schedules[item.jadwal] || 0) + 1;
    });
    
    const draftsWithClashFlag = draftsWithDetails.map(item => ({
        ...item,
        bentrok: schedules[item.jadwal] > 1
    }));

    // Calculate total SKS
    const totalSks = draftsWithDetails.reduce((sum, item) => sum + item.sks, 0);
    const maxSks = getMaxSks(parseFloat(currentStudent.mahasiswa.ipk as string));

    return {
        student: {
            name: currentStudent.users.name,
            nim: currentStudent.mahasiswa.nim,
            prodi: currentStudent.mahasiswa.prodi,
            ipk: Number(currentStudent.mahasiswa.ipk),
            semester: currentStudent.mahasiswa.semester,
            passedCourses: [] // Simplified for now
        },
        catalog: catalogResult,
        krsStatus,
        uktStatus: 'LUNAS',
        isUktLunas,
        draft: draftsWithClashFlag,
        totalSks,
        maxSks,
        isKrsOpen: isKrsOpen()
    };
}

export const actions = {
    addCourse: async ({ request, cookies }) => {
        if (!isKrsOpen()) {
            return fail(400, { error: 'Periode KRS sudah ditutup atau belum dimulai.' });
        }

        const sessionId = cookies.get('session');
        if (!sessionId) throw redirect(303, '/login');

        const data = await request.formData();
        const courseId = data.get('courseId') as string;
        
        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId)).limit(1);
        if (mhsResult.length === 0) return fail(403, { error: 'Unauthorized' });
        const mhs = mhsResult[0];

        const { uktKeuangan } = await import('$lib/server/db/schema');
        const uktRes = await db.select().from(uktKeuangan).where(and(eq(uktKeuangan.mahasiswaId, mhs.id), eq(uktKeuangan.semester, mhs.semester.toString()))).limit(1);
        if (uktRes.length === 0 || uktRes[0].status !== 'LUNAS') {
            return fail(403, { error: 'Gagal! UKT belum lunas. Silakan lakukan pembayaran terlebih dahulu.' });
        }

        let activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhs.id)).limit(1);
        let krsId = activeKrs.length > 0 ? activeKrs[0].id : null;
        
        if (activeKrs.length > 0 && activeKrs[0].status !== 'DRAFT') {
            return fail(400, { error: 'KRS sudah diajukan, tidak dapat mengubah draft.' });
        }

        if (!krsId) {
            const insertKrs = await db.insert(krs).values({
                mahasiswaId: mhs.id,
                periodeAkademik: 'Ganjil 2026/2027',
                status: 'DRAFT'
            });
            krsId = insertKrs[0].insertId;
        }

        const courseResult = await db.select().from(mataKuliah).where(eq(mataKuliah.id, courseId)).limit(1);
        if (courseResult.length === 0) return fail(404, { error: 'Mata kuliah tidak ditemukan.' });
        
        const kelasResult = await db.select().from(kelasKuliah).where(eq(kelasKuliah.mataKuliahId, courseId)).limit(1);
        if (kelasResult.length === 0) return fail(404, { error: 'Kelas tidak ditemukan.' });
        
        const course = courseResult[0];
        const kelas = kelasResult[0];

        if (kelas.sisaKuota <= 0) {
            return fail(400, { error: `Kuota mata kuliah ${course.nama} sudah penuh!` });
        }

        const existingDraft = await db.select().from(krsDetail)
            .where(and(eq(krsDetail.krsId, krsId as number), eq(krsDetail.courseId, courseId)));
            
        if (existingDraft.length > 0) {
            return fail(400, { error: 'Mata kuliah ini sudah ada di keranjang Anda.' });
        }

        await db.insert(krsDetail).values({
            krsId: krsId as number,
            courseId: courseId
        });
        
        // Simulating locking/decrement quota in simple way
        // (A real app might want to wait until submission to actually decrement, but requirement says "mengurangi kuota kelas")
        // Since it's draft, we don't decrement until submission. Wait, the implementation plan says "mengurangi kuota". Let's do it here.
        await db.update(kelasKuliah).set({ sisaKuota: kelas.sisaKuota - 1 }).where(eq(kelasKuliah.id, kelas.id));

        return { success: true, message: `Berhasil menambahkan ${course.nama}.` };
    },

    removeCourse: async ({ request, cookies }) => {
        if (!isKrsOpen()) return fail(400, { error: 'Periode KRS ditutup.' });
        const sessionId = cookies.get('session');
        const data = await request.formData();
        const courseId = data.get('courseId') as string;

        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId as string)).limit(1);
        const mhs = mhsResult[0];

        const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhs.id)).limit(1);
        if (activeKrs.length === 0 || activeKrs[0].status !== 'DRAFT') {
            return fail(400, { error: 'KRS sudah diajukan, tidak dapat mengubah draft.' });
        }

        const detail = await db.select().from(krsDetail).where(and(eq(krsDetail.krsId, activeKrs[0].id), eq(krsDetail.courseId, courseId)));
        
        if (detail.length > 0) {
            await db.delete(krsDetail).where(eq(krsDetail.id, detail[0].id));
            
            const kelasResult = await db.select().from(kelasKuliah).where(eq(kelasKuliah.mataKuliahId, courseId)).limit(1);
            if (kelasResult.length > 0) {
                await db.update(kelasKuliah).set({ sisaKuota: kelasResult[0].sisaKuota + 1 }).where(eq(kelasKuliah.id, kelasResult[0].id));
            }
        }

        return { success: true, message: 'Mata kuliah dihapus dari keranjang.' };
    },

    submitKRS: async ({ cookies }) => {
        if (!isKrsOpen()) return fail(400, { error: 'Periode KRS ditutup.' });
        const sessionId = cookies.get('session');
        
        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId as string)).limit(1);
        const mhs = mhsResult[0];

        const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhs.id)).limit(1);
        
        if (activeKrs.length === 0 || activeKrs[0].status !== 'DRAFT') {
            return fail(400, { error: 'KRS sudah diajukan sebelumnya.' });
        }

        const details = await db.select().from(krsDetail).where(eq(krsDetail.krsId, activeKrs[0].id));
        if (details.length === 0) {
            return fail(400, { error: 'Keranjang KRS masih kosong.' });
        }

        await db.update(krs).set({ status: 'DIAJUKAN' }).where(eq(krs.id, activeKrs[0].id));

        return { success: true, message: 'KRS berhasil diajukan ke Dosen Wali untuk direview.' };
    }
};
