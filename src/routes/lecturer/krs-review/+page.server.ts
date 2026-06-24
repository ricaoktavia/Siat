import { db } from '$lib/server/mockDb';
import { fail } from '@sveltejs/kit';

export function load() {
    return {
        submittedStudents: db.krsReviewQueue
    };
}

export const actions = {
    approve: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        
        const student = db.krsReviewQueue.find(s => s.nim === nim);
        if (student) {
            student.status = 'DISETUJUI';
            
            // Log security audit
            db.auditLogs.unshift({
                id: 'l' + (db.auditLogs.length + 1),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                user: 'Dr. Ir. Riza',
                action: 'APPROVE_KRS',
                detail: `Menyetujui KRS mahasiswa ${student.name} (${nim})`
            });
        }
        return { success: true };
    },

    reject: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        const reason = data.get('reason') as string;
        
        const student = db.krsReviewQueue.find(s => s.nim === nim);
        if (student) {
            student.status = 'DITOLAK';
            (student as any).rejectionReason = reason;

            // Log security audit
            db.auditLogs.unshift({
                id: 'l' + (db.auditLogs.length + 1),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                user: 'Dr. Ir. Riza',
                action: 'REJECT_KRS',
                detail: `Menolak KRS mahasiswa ${student.name} (${nim}). Alasan: ${reason}`
            });
        }
        return { success: true };
    },

    returnForRevision: async ({ request }) => {
        const data = await request.formData();
        const nim = data.get('nim') as string;
        const note = data.get('note') as string;
        
        const student = db.krsReviewQueue.find(s => s.nim === nim);
        if (student) {
            student.status = 'DRAFT'; // Set back to draft for student to edit
            (student as any).note = note;
            
            // In a real app, you'd move this back to the student's personal KRS state
            // For simulation, we'll just change the status here or keep it in the queue with a 'REVISI' flag
            student.status = 'REVISI' as any;
            (student as any).rejectionReason = note;

            // Log security audit
            db.auditLogs.unshift({
                id: 'l' + (db.auditLogs.length + 1),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                user: 'Dr. Ir. Riza',
                action: 'RETURN_KRS',
                detail: `Mengembalikan KRS mahasiswa ${student.name} (${nim}) untuk revisi: ${note}`
            });
        }
        return { success: true };
    }
};
