import { db } from '$lib/server/db';
import { mahasiswa, users, grades, mataKuliah, kelasKuliah } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

function getLetterGrade(final: number): { letter: string, bobot: number } {
    if (final >= 85) return { letter: 'A', bobot: 4.0 };
    if (final >= 80) return { letter: 'A-', bobot: 3.7 };
    if (final >= 75) return { letter: 'B+', bobot: 3.3 };
    if (final >= 70) return { letter: 'B', bobot: 3.0 };
    if (final >= 65) return { letter: 'B-', bobot: 2.7 };
    if (final >= 60) return { letter: 'C+', bobot: 2.3 };
    if (final >= 55) return { letter: 'C', bobot: 2.0 };
    if (final >= 40) return { letter: 'D', bobot: 1.0 };
    return { letter: 'E', bobot: 0.0 };
}

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(303, '/login');
    }

    const userResult = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (userResult.length === 0 || userResult[0].role !== 'STUDENT') {
        throw redirect(303, '/login');
    }
    const user = userResult[0];

    const studentResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, user.id)).limit(1);
    if (studentResult.length === 0) {
        throw redirect(303, '/login');
    }
    const student = studentResult[0];

    const allGrades = await db.select({
        kode: mataKuliah.kode,
        nama: mataKuliah.nama,
        sks: mataKuliah.sks,
        final: grades.final,
        status: grades.status
    })
    .from(grades)
    .innerJoin(mataKuliah, eq(grades.mataKuliahId, mataKuliah.id))
    .where(eq(grades.mahasiswaId, student.id));

    const khsData: Record<string, any[]> = {
        [student.semester.toString()]: []
    };

    let totalSksTempuh = 0;
    let totalBobot = 0;

    allGrades.forEach(g => {
        let nilai = '-';
        let bobot = 0;
        
        if (g.status === 'FINAL') {
            const gradeInfo = getLetterGrade(parseFloat(g.final as string));
            nilai = gradeInfo.letter;
            bobot = gradeInfo.bobot;
            totalSksTempuh += g.sks;
            totalBobot += (bobot * g.sks);
        }

        if (!khsData[student.semester.toString()]) {
            khsData[student.semester.toString()] = [];
        }

        khsData[student.semester.toString()].push({
            kode: g.kode,
            nama: g.nama,
            sks: g.sks,
            nilai: nilai,
            bobot: bobot
        });
    });

    const ipk = totalSksTempuh > 0 ? (totalBobot / totalSksTempuh) : 0;

    const transcript = [
        {
            semester: student.semester.toString(),
            gpa: ipk,
            courses: khsData[student.semester.toString()].map(c => ({
                kode: c.kode,
                nama: c.nama,
                sks: c.sks,
                nilai: c.nilai,
                angka: c.bobot
            }))
        }
    ];

    return {
        currentStudent: {
            nim: student.nim,
            name: user.name,
            prodi: student.prodi,
            semester: student.semester
        },
        khsData,
        academicStats: {
            ipk: ipk,
            ips: ipk,
            sksLulus: totalSksTempuh,
            sksTotal: 144
        },
        transcript
    };
}
