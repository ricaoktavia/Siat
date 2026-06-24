import { db } from '$lib/server/mockDb';

export function load() {
    return {
        presensi: db.presensi
    };
}

export const actions = {
    markAttendance: async ({ request }) => {
        const data = await request.formData();
        const kode = data.get('kode');
        
        const course = db.presensi.find(p => p.kode === kode);
        if (course && course.hadir < course.total) {
            course.hadir += 1;
            course.persentase = parseFloat(((course.hadir / course.total) * 100).toFixed(1));
        }
        
        return { success: true, message: `Absensi Berhasil! Anda tercatat hadir di mata kuliah ${course?.nama}.` };
    }
};
