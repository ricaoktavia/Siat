import { db } from '$lib/server/mockDb';
import { fail } from '@sveltejs/kit';

export function load() {
    // In a real app, filter by lecturer ID
    const myCourses = db.catalog.filter(c => c.dosen.includes('Riza'));
    
    // Join student data with grades
    const gradesWithStudents = db.studentsGrades.map(g => {
        const student = db.users.find(u => u.username === g.nim);
        const course = db.catalog.find(c => c.id === g.courseId);
        return { ...g, studentName: student?.name, courseName: course?.nama };
    });

    return {
        courses: myCourses,
        grades: gradesWithStudents,
        logs: db.auditLogs
    };
}

export const actions = {
    updateGrade: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        const courseId = data.get('courseId') as string;
        const uts = parseFloat(data.get('uts') as string) || 0;
        const uas = parseFloat(data.get('uas') as string) || 0;
        const isFinalize = data.get('finalize') === 'true';

        const gradeIdx = db.studentsGrades.findIndex(g => g.nim === nim && g.courseId === courseId);
        
        if (gradeIdx === -1) return fail(404, { error: true, message: 'Data mahasiswa tidak ditemukan' });

        const grade = db.studentsGrades[gradeIdx];
        
        if (grade.status === 'FINAL') {
            return fail(400, { error: true, message: 'Nilai sudah dikunci dan tidak bisa diubah.' });
        }

        grade.uts = uts;
        grade.uas = uas;
        
        if (isFinalize) {
            grade.final = parseFloat(((uts * 0.4) + (uas * 0.6)).toFixed(2));
            grade.status = 'FINAL';
            
            // Log Security Audit
            db.auditLogs.unshift({
                id: 'l' + (db.auditLogs.length + 1),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                user: 'Dr. Ir. Riza',
                action: 'FINALIZE_GRADE',
                detail: `Mengunci nilai Akhir mahasiswa ${nim} (MK ID: ${courseId})`
            });
        } else {
            db.auditLogs.unshift({
                id: 'l' + (db.auditLogs.length + 1),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                user: 'Dr. Ir. Riza',
                action: 'UPDATE_GRADE',
                detail: `Update draft UTS/UAS mahasiswa ${nim} (MK ID: ${courseId})`
            });
        }

        return { success: true, message: isFinalize ? 'Nilai berhasil dikunci!' : 'Draft nilai disimpan.' };
    },

    unlockGrade: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        const courseId = data.get('courseId') as string;

        const gradeIdx = db.studentsGrades.findIndex(g => g.nim === nim && g.courseId === courseId);
        if (gradeIdx !== -1) {
            db.studentsGrades[gradeIdx].status = 'DRAFT';
            
            // Log Security Audit
            db.auditLogs.unshift({
                id: 'l' + (db.auditLogs.length + 1),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                user: 'Dr. Ir. Riza',
                action: 'UNLOCK_GRADE',
                detail: `Membuka kunci nilai mahasiswa ${nim} (MK ID: ${courseId})`
            });
        }
        return { success: true, message: 'Nilai berhasil dibuka kembali.' };
    }
};
