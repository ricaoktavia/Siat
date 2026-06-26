import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

async function seed() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'siat'
        });
        
        try {
            await connection.query('DELETE FROM krs_detail;');
            await connection.query('DELETE FROM krs;');
            await connection.query('DELETE FROM presensi;');
            await connection.query('DELETE FROM grades;');
            await connection.query('DELETE FROM ukt_keuangan;');
            await connection.query('DELETE FROM kelas_kuliah;');
            await connection.query('DELETE FROM mata_kuliah_prasyarat;');
            await connection.query('DELETE FROM mata_kuliah;');
            await connection.query('DELETE FROM mahasiswa;');
            await connection.query('DELETE FROM users;');
        } catch(e) {
            console.log('Some tables might not exist, ignoring delete errors.');
        }

        // Add new columns if they don't exist
        try {
            await connection.query(`ALTER TABLE mahasiswa ADD COLUMN nik varchar(20), ADD COLUMN tempat_lahir varchar(50), ADD COLUMN tanggal_lahir varchar(50), ADD COLUMN jenis_kelamin varchar(20), ADD COLUMN agama varchar(20), ADD COLUMN kewarganegaraan varchar(20), ADD COLUMN golongan_darah varchar(5), ADD COLUMN email varchar(100), ADD COLUMN email_pribadi varchar(100), ADD COLUMN no_hp varchar(20), ADD COLUMN alamat_asal text, ADD COLUMN alamat_domisili text, ADD COLUMN nama_ayah varchar(100), ADD COLUMN pekerjaan_ayah varchar(100), ADD COLUMN nama_ibu varchar(100), ADD COLUMN pekerjaan_ibu varchar(100), ADD COLUMN no_telepon_darurat varchar(20);`);
        } catch (e) {
            console.log('Columns likely already exist, ignoring error.');
        }

        await connection.query(`
            INSERT INTO users (id, username, password, role, name) VALUES 
            ('dosen1', '7104313441', '7104313441', 'LECTURER', 'Sholeh Rahcmatullah'),
            ('mhs1', '2023520036', '2023520036', 'STUDENT', 'Mustafida'),
            ('mhs2', '2023520006', '2023520006', 'STUDENT', 'Rica Oktavia'),
            ('mhs3', '2023520040', '2023520040', 'STUDENT', 'Afifatun Nahriyah'),
            ('mhs4', '2023520001', '2023520001', 'STUDENT', 'Sofa Aulia Rofika');
        `);

        await connection.query(`
            INSERT INTO mahasiswa (id, user_id, nim, prodi, ipk, semester, pembimbing_akademik_id, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, kewarganegaraan, golongan_darah, email, email_pribadi, no_hp, alamat_asal, alamat_domisili, nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_darurat) VALUES
            (1, 'mhs1', '2023520036', 'Teknik Informatika', 3.85, 6, 'dosen1', '3528012345670001', 'Pamekasan', '12 Mei 2003', 'Perempuan', 'Islam', 'WNI', 'O', 'mustafida@mhs.nusantara.ac.id', 'mustafida.pamekasan@gmail.com', '081234567801', 'Jl. Trunojoyo No. 12, Pamekasan, Madura', 'Jl. Mawar No. 5, Kos Putri', 'Bapak Mustafida', 'Wiraswasta', 'Ibu Mustafida', 'Ibu Rumah Tangga', '081234567801'),
            (2, 'mhs2', '2023520006', 'Teknik Informatika', 3.92, 6, 'dosen1', '3527012345670002', 'Sampang', '05 Agustus 2002', 'Perempuan', 'Islam', 'WNI', 'A', 'rica.oktavia@mhs.nusantara.ac.id', 'rica.oktavia@gmail.com', '081234567802', 'Jl. Rajawali No. 8, Sampang, Madura', 'Jl. Kenanga No. 10, Kos Putri', 'Bapak Rica', 'PNS', 'Ibu Rica', 'Guru', '081234567802'),
            (3, 'mhs3', '2023520040', 'Teknik Informatika', 3.75, 6, 'dosen1', '3528012345670003', 'Pamekasan', '20 November 2003', 'Perempuan', 'Islam', 'WNI', 'B', 'afifatun.nahriyah@mhs.nusantara.ac.id', 'afifatun@gmail.com', '081234567803', 'Jl. Panglima Sudirman No. 3, Pamekasan, Madura', 'Jl. Melati No. 1, Kos Putri', 'Bapak Afifatun', 'Wiraswasta', 'Ibu Afifatun', 'Ibu Rumah Tangga', '081234567803'),
            (4, 'mhs4', '2023520001', 'Teknik Informatika', 3.68, 6, 'dosen1', '3527012345670004', 'Sampang', '15 Februari 2003', 'Perempuan', 'Islam', 'WNI', 'AB', 'sofa.aulia@mhs.nusantara.ac.id', 'sofa.aulia@gmail.com', '081234567804', 'Jl. Pahlawan No. 20, Sampang, Madura', 'Jl. Anggrek No. 12, Kos Putri', 'Bapak Sofa', 'Pegawai Swasta', 'Ibu Sofa', 'Ibu Rumah Tangga', '081234567804');
        `);

        await connection.query(`
            INSERT INTO mata_kuliah (id, kode, nama, sks) VALUES
            ('1', 'IF3101', 'Desain dan Analisis Algoritma', 3),
            ('2', 'IF3102', 'Pemrograman Web Lanjut', 3),
            ('3', 'IF3103', 'Kecerdasan Buatan', 3),
            ('4', 'IF3104', 'Sistem Basis Data', 4);
        `);

        await connection.query(`
            INSERT INTO kelas_kuliah (id, mata_kuliah_id, dosen_utama, jadwal, kuota_maksimal, sisa_kuota) VALUES
            (1, '1', 'Sholeh Rahcmatullah', 'Senin, 08:00 - 10:30', 40, 40),
            (2, '2', 'Sholeh Rahcmatullah', 'Selasa, 13:00 - 15:30', 40, 40),
            (3, '3', 'Sholeh Rahcmatullah', 'Rabu, 08:00 - 10:30', 30, 30),
            (4, '4', 'Sholeh Rahcmatullah', 'Kamis, 08:00 - 11:20', 40, 40);
        `);

        console.log('Database seeded with new dummy data!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
