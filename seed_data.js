import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

async function seed() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'siat_db'
        });
        
        await connection.query(`
            INSERT IGNORE INTO users (id, username, password, role, name) VALUES 
            ('u1', '210101001', 'password123', 'STUDENT', 'Budi Santoso'),
            ('u2', '19850101', 'password123', 'LECTURER', 'Dr. Ir. Riza, M.T.'),
            ('u3', '210101045', 'password123', 'STUDENT', 'Ani Wijaya');
        `);

        await connection.query(`
            INSERT IGNORE INTO mahasiswa (id, user_id, nim, prodi, ipk, semester, pembimbing_akademik_id) VALUES
            (1, 'u1', '210101001', 'Teknik Informatika', 3.15, 5, 'u2'),
            (2, 'u3', '210101045', 'Teknik Informatika', 3.82, 5, 'u2');
        `);

        await connection.query(`
            INSERT IGNORE INTO mata_kuliah (id, kode, nama, sks) VALUES
            ('1', 'IF3101', 'Desain dan Analisis Algoritma', 3);
        `);

        await connection.query(`
            INSERT IGNORE INTO kelas_kuliah (id, mata_kuliah_id, dosen_utama, jadwal, kuota_maksimal, sisa_kuota, dosen_user_id) VALUES
            (1, '1', 'Dr. Ir. Riza', 'Senin, 08:00 - 10:30', 40, 15, 'u2');
        `);

        console.log('Seeded 2 students, 1 lecturer, and 1 class');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
