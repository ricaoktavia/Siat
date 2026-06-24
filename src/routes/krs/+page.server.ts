import { fail } from '@sveltejs/kit';
import { db, getMaxSks } from '$lib/server/mockDb';

export function load() {
    // Enrich draft data with full course details to send to the client
    const draftsWithDetails = db.krs.drafts.map(draft => {
        const course = db.catalog.find(c => c.id === draft.courseId);
        return {
            id: course!.id,
            kode: course!.kode,
            nama: course!.nama,
            sks: course!.sks,
            jadwal: course!.jadwal,
            // Clash detection is recalculated below anyway, but we pass basic data
        };
    });

    // Check for schedule clashes among drafted courses
    const schedules: Record<string, number> = {};
    draftsWithDetails.forEach(item => {
        schedules[item.jadwal] = (schedules[item.jadwal] || 0) + 1;
    });
    
    const draftsWithClashFlag = draftsWithDetails.map(item => ({
        ...item,
        bentrok: schedules[item.jadwal] > 1
    }));

    // Calculate total SKS in draft
    const totalSks = draftsWithDetails.reduce((sum, item) => sum + item.sks, 0);

    return {
        student: db.currentStudent,
        catalog: db.catalog,
        krsStatus: db.krs.status,
        uktStatus: (db as any).uktStatus,
        draft: draftsWithClashFlag,
        totalSks,
        maxSks: getMaxSks(db.currentStudent.ipk)
    };
}

export const actions = {
    addCourse: async ({ request }) => {
        if (db.krs.status !== 'DRAFT') {
            return fail(400, { error: 'KRS sudah diajukan, tidak dapat mengubah draft.' });
        }

        const data = await request.formData();
        const courseId = data.get('courseId') as string;

        const course = db.catalog.find(c => c.id === courseId);
        if (!course) {
            return fail(404, { error: 'Mata kuliah tidak ditemukan.' });
        }

        // 1. Quota Check
        if (course.sisa <= 0) {
            return fail(400, { error: `Kuota mata kuliah ${course.nama} sudah penuh!` });
        }

        // 2. Draft Check (Already taken)
        if (db.krs.drafts.some(d => d.courseId === courseId)) {
            return fail(400, { error: 'Mata kuliah ini sudah ada di keranjang Anda.' });
        }

        // 3. Prerequisite Check
        const missingPrereqs = course.prerequisites.filter(prereqId => !db.currentStudent.passedCourses.includes(prereqId));
        if (missingPrereqs.length > 0) {
            return fail(400, { error: `Gagal: Anda belum lulus mata kuliah prasyarat (${missingPrereqs.join(', ')}).` });
        }

        // 4. Max SKS Check
        const maxSks = getMaxSks(db.currentStudent.ipk);
        const currentTotalSks = db.krs.drafts.reduce((sum, draft) => {
            const c = db.catalog.find(cat => cat.id === draft.courseId);
            return sum + (c ? c.sks : 0);
        }, 0);

        if (currentTotalSks + course.sks > maxSks) {
            return fail(400, { error: `Total SKS akan melebihi batas maksimal (${maxSks} SKS).` });
        }

        // 5. Schedule Clash Check
        const draftedSchedules = db.krs.drafts.map(d => {
            const c = db.catalog.find(cat => cat.id === d.courseId);
            return c?.jadwal;
        });

        if (draftedSchedules.includes(course.jadwal)) {
            return fail(400, { error: `Jadwal bentrok! Anda sudah mengambil mata kuliah di waktu: ${course.jadwal}.` });
        }

        // --- All checks passed ---
        // Decrement quota (simulating concurrency/locking)
        course.sisa -= 1;
        
        // Add to draft
        db.krs.drafts.push({ courseId });

        return { success: true, message: `Berhasil menambahkan ${course.nama}.` };
    },

    removeCourse: async ({ request }) => {
        if (db.krs.status !== 'DRAFT') {
            return fail(400, { error: 'KRS sudah diajukan, tidak dapat mengubah draft.' });
        }

        const data = await request.formData();
        const courseId = data.get('courseId') as string;

        const draftIndex = db.krs.drafts.findIndex(d => d.courseId === courseId);
        if (draftIndex !== -1) {
            // Remove from draft
            db.krs.drafts.splice(draftIndex, 1);
            
            // Re-increment quota
            const course = db.catalog.find(c => c.id === courseId);
            if (course) {
                course.sisa += 1;
            }
        }

        return { success: true, message: 'Mata kuliah dihapus dari keranjang.' };
    },

    submitKRS: async () => {
        if (db.krs.status !== 'DRAFT') {
            return fail(400, { error: 'KRS sudah diajukan sebelumnya.' });
        }
        if (db.krs.drafts.length === 0) {
            return fail(400, { error: 'Keranjang KRS masih kosong.' });
        }

        // Change status to simulate Maker submitting to Checker (Dosen Wali)
        db.krs.status = 'DIAJUKAN';

        return { success: true, message: 'KRS berhasil diajukan ke Dosen Wali untuk direview.' };
    },

    createCourse: async ({ request }) => {
        const data = await request.formData();
        const kode = data.get('kode') as string;
        const nama = data.get('nama') as string;
        const sks = parseInt(data.get('sks') as string);
        const dosen = data.get('dosen') as string;
        const jadwal = data.get('jadwal') as string;
        const kuota = parseInt(data.get('kuota') as string);

        if (!kode || !nama || isNaN(sks) || !dosen || !jadwal || isNaN(kuota)) {
            return fail(400, { error: 'Semua data mata kuliah harus diisi dengan benar.' });
        }

        const newId = (db.catalog.length + 1).toString();
        db.catalog.push({
            id: newId,
            kode,
            nama,
            sks,
            dosen,
            jadwal,
            kuota,
            sisa: kuota,
            prerequisites: []
        });

        return { success: true, message: `Mata kuliah ${nama} berhasil ditambahkan ke katalog!` };
    }
};
