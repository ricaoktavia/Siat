import { db } from '$lib/server/db';
import { mahasiswa, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

    const mentoredStudents = await db.select({
        id: mahasiswa.id,
        nim: mahasiswa.nim,
        name: users.name,
        prodi: mahasiswa.prodi,
        ipk: mahasiswa.ipk,
        semester: mahasiswa.semester,
        email: mahasiswa.emailPribadi,
        noHp: mahasiswa.noHp
    })
    .from(mahasiswa)
    .innerJoin(users, eq(mahasiswa.userId, users.id))
    .where(eq(mahasiswa.pembimbingAkademikId, lecturer.id));

    const students = mentoredStudents.map(s => ({
        ...s,
        ipk: parseFloat(s.ipk as string),
        status: 'Aktif'
    }));

    return {
        students
    };
}
