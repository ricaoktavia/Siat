-- Skema Database SIAT - Modul Pengisian KRS
-- Dibuat untuk eksekusi di MySQL / MariaDB (phpMyAdmin)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- --------------------------------------------------------
-- Tabel `mahasiswa`
-- --------------------------------------------------------
CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nim` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `prodi` varchar(50) NOT NULL,
  `ipk_terakhir` decimal(3,2) NOT NULL DEFAULT '0.00',
  `batas_sks` int(11) NOT NULL DEFAULT '24',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nim` (`nim`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy Mahasiswa
INSERT INTO `mahasiswa` (`id`, `nim`, `nama`, `prodi`, `ipk_terakhir`, `batas_sks`) VALUES
(1, '210101001', 'Budi Santoso', 'Teknik Informatika', 3.75, 24);


-- --------------------------------------------------------
-- Tabel `dosen`
-- --------------------------------------------------------
CREATE TABLE `dosen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(20) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy Dosen
INSERT INTO `dosen` (`id`, `nip`, `nama_lengkap`) VALUES
(1, '198001012005011001', 'Dr. Ir. Riza'),
(2, '198203152006041002', 'Budi Raharjo, M.Kom'),
(3, '197505202001122001', 'Dr. Ayu Lestari'),
(4, '196811101995031001', 'Prof. Hasanuddin'),
(5, '198507082010121003', 'Doni Pratama, M.T.'),
(6, '196502281990031002', 'Drs. Supriyanto'),
(7, '198809122015042001', 'Siti Aminah, M.Ds.');


-- --------------------------------------------------------
-- Tabel `mata_kuliah`
-- --------------------------------------------------------
CREATE TABLE `mata_kuliah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(10) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `sks` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `prodi` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy Mata Kuliah
INSERT INTO `mata_kuliah` (`id`, `kode`, `nama`, `sks`, `semester`, `prodi`) VALUES
(1, 'IF3101', 'Desain dan Analisis Algoritma', 3, 5, 'Teknik Informatika'),
(2, 'IF3102', 'Pemrograman Web Lanjut', 3, 5, 'Teknik Informatika'),
(3, 'IF3103', 'Kecerdasan Buatan', 3, 5, 'Teknik Informatika'),
(4, 'IF3104', 'Sistem Basis Data', 4, 5, 'Teknik Informatika'),
(5, 'IF3105', 'Jaringan Komputer', 3, 5, 'Teknik Informatika'),
(6, 'KU2001', 'Pendidikan Pancasila', 2, 5, 'Umum'),
(7, 'IF3106', 'Interaksi Manusia dan Komputer', 3, 5, 'Teknik Informatika');


-- --------------------------------------------------------
-- Tabel `kelas_kuliah` (Jadwal & Kuota)
-- --------------------------------------------------------
CREATE TABLE `kelas_kuliah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mata_kuliah_id` int(11) NOT NULL,
  `dosen_id` int(11) NOT NULL,
  `periode_akademik` varchar(20) NOT NULL,
  `jadwal_hari` varchar(10) NOT NULL,
  `jadwal_waktu` varchar(20) NOT NULL,
  `kuota_maksimal` int(11) NOT NULL,
  `sisa_kuota` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`dosen_id`) REFERENCES `dosen`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy Kelas (Berdasarkan Katalog di UI)
INSERT INTO `kelas_kuliah` (`id`, `mata_kuliah_id`, `dosen_id`, `periode_akademik`, `jadwal_hari`, `jadwal_waktu`, `kuota_maksimal`, `sisa_kuota`) VALUES
(1, 1, 1, 'Ganjil 2026/2027', 'Senin', '08:00 - 10:30', 40, 15),
(2, 2, 2, 'Ganjil 2026/2027', 'Selasa', '13:00 - 15:30', 40, 3),
(3, 3, 3, 'Ganjil 2026/2027', 'Rabu', '08:00 - 10:30', 30, 0),
(4, 4, 4, 'Ganjil 2026/2027', 'Kamis', '08:00 - 11:20', 40, 20),
(5, 5, 5, 'Ganjil 2026/2027', 'Jumat', '13:00 - 15:30', 30, 1),
(6, 6, 6, 'Ganjil 2026/2027', 'Senin', '13:00 - 14:40', 50, 45),
(7, 7, 7, 'Ganjil 2026/2027', 'Selasa', '13:00 - 15:30', 40, 10);


-- --------------------------------------------------------
-- Tabel `krs` (Header Pengajuan KRS)
-- --------------------------------------------------------
CREATE TABLE `krs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `periode_akademik` varchar(20) NOT NULL,
  `status` enum('DRAFT','DIAJUKAN','DISETUJUI','DITOLAK') NOT NULL DEFAULT 'DRAFT',
  `total_sks` int(11) NOT NULL DEFAULT '0',
  `waktu_pengajuan` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy KRS Header (Belum ada yang diajukan)
INSERT INTO `krs` (`id`, `mahasiswa_id`, `periode_akademik`, `status`, `total_sks`, `waktu_pengajuan`) VALUES
(1, 1, 'Ganjil 2026/2027', 'DRAFT', 9, NULL);


-- --------------------------------------------------------
-- Tabel `krs_detail` (Item Mata Kuliah yang Dipilih)
-- --------------------------------------------------------
CREATE TABLE `krs_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `krs_id` int(11) NOT NULL,
  `kelas_kuliah_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`krs_id`) REFERENCES `krs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`kelas_kuliah_id`) REFERENCES `kelas_kuliah`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy Draft KRS Item
INSERT INTO `krs_detail` (`id`, `krs_id`, `kelas_kuliah_id`) VALUES
(1, 1, 1), -- IF3101
(2, 1, 2), -- IF3102
(3, 1, 7); -- IF3106

COMMIT;
