-- Skema Database SIAT Lengkap (Sistem Informasi Akademik Terpadu)
-- Sesuai dengan struktur data pada mockDb.ts

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- 1. Tabel users
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('STUDENT', 'LECTURER', 'ADMIN') NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `password`, `role`, `name`) VALUES
('u1', '210101001', 'password123', 'STUDENT', 'Budi Santoso'),
('u2', '19850101', 'password123', 'LECTURER', 'Dr. Ir. Riza, M.T.'),
('u3', '210101045', 'password123', 'STUDENT', 'Ani Wijaya'),
('u4', '210101088', 'password123', 'STUDENT', 'Dedi Kurniawan');

-- 2. Tabel mahasiswa
CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `prodi` varchar(50) NOT NULL,
  `ipk` decimal(3,2) NOT NULL DEFAULT '0.00',
  `semester` int(11) NOT NULL DEFAULT '1',
  `pembimbing_akademik_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nim` (`nim`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `mahasiswa` (`id`, `user_id`, `nim`, `prodi`, `ipk`, `semester`, `pembimbing_akademik_id`) VALUES
(1, 'u1', '210101001', 'Teknik Informatika', 3.15, 5, 'u2'),
(2, 'u3', '210101045', 'Teknik Informatika', 3.82, 5, 'u2'),
(3, 'u4', '210101088', 'Sistem Informasi', 2.95, 5, 'u2');

-- 3. Tabel mata_kuliah
CREATE TABLE `mata_kuliah` (
  `id` varchar(50) NOT NULL,
  `kode` varchar(10) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `sks` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `mata_kuliah` (`id`, `kode`, `nama`, `sks`) VALUES
('1', 'IF3101', 'Desain dan Analisis Algoritma', 3),
('2', 'IF3102', 'Pemrograman Web Lanjut', 3),
('3', 'IF3103', 'Kecerdasan Buatan', 3),
('4', 'IF3104', 'Sistem Basis Data', 4),
('5', 'IF3105', 'Jaringan Komputer', 3);

-- 4. Tabel mata_kuliah_prasyarat
CREATE TABLE `mata_kuliah_prasyarat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mata_kuliah_id` varchar(50) NOT NULL,
  `prasyarat_kode` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `mata_kuliah_prasyarat` (`mata_kuliah_id`, `prasyarat_kode`) VALUES
('1', 'IF1101'),
('2', 'IF2101');

-- 5. Tabel kelas_kuliah
CREATE TABLE `kelas_kuliah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mata_kuliah_id` varchar(50) NOT NULL,
  `dosen_utama` varchar(100) NOT NULL,
  `jadwal` varchar(50) NOT NULL,
  `kuota_maksimal` int(11) NOT NULL,
  `sisa_kuota` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `kelas_kuliah` (`id`, `mata_kuliah_id`, `dosen_utama`, `jadwal`, `kuota_maksimal`, `sisa_kuota`) VALUES
(1, '1', 'Dr. Ir. Riza', 'Senin, 08:00 - 10:30', 40, 15),
(2, '2', 'Budi Raharjo, M.Kom', 'Selasa, 13:00 - 15:30', 40, 3),
(3, '3', 'Dr. Ayu Lestari', 'Rabu, 08:00 - 10:30', 30, 0),
(4, '4', 'Prof. Hasanuddin', 'Kamis, 08:00 - 11:20', 40, 20),
(5, '5', 'Doni Pratama, M.T.', 'Jumat, 13:00 - 15:30', 30, 1);

-- 6. Tabel krs
CREATE TABLE `krs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `periode_akademik` varchar(20) NOT NULL,
  `status` enum('DRAFT','DIAJUKAN','DISETUJUI','DITOLAK') NOT NULL DEFAULT 'DRAFT',
  `rejection_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `krs` (`id`, `mahasiswa_id`, `periode_akademik`, `status`, `rejection_reason`) VALUES
(1, 1, 'Ganjil 2026/2027', 'DRAFT', NULL),
(2, 2, 'Ganjil 2026/2027', 'DIAJUKAN', NULL),
(3, 3, 'Ganjil 2026/2027', 'DIAJUKAN', NULL);

-- 7. Tabel krs_detail
CREATE TABLE `krs_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `krs_id` int(11) NOT NULL,
  `course_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`krs_id`) REFERENCES `krs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `krs_detail` (`krs_id`, `course_id`) VALUES
(2, '1'), (2, '2'), (2, '4'),
(3, '1'), (3, '5');

-- 8. Tabel ukt_keuangan
CREATE TABLE `ukt_keuangan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `deadline` varchar(50) NOT NULL,
  `virtual_account` varchar(30) NOT NULL,
  `status` enum('BELUM_BAYAR','LUNAS') NOT NULL DEFAULT 'BELUM_BAYAR',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `ukt_keuangan` (`mahasiswa_id`, `semester`, `jumlah`, `deadline`, `virtual_account`, `status`) VALUES
(1, 'Ganjil 2026/2027', 5000000.00, '10 Agustus 2026', '8801210101001', 'BELUM_BAYAR');

-- 9. Tabel presensi
CREATE TABLE `presensi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `mata_kuliah_id` varchar(50) NOT NULL,
  `hadir` int(11) NOT NULL DEFAULT '0',
  `total_pertemuan` int(11) NOT NULL DEFAULT '14',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `presensi` (`mahasiswa_id`, `mata_kuliah_id`, `hadir`, `total_pertemuan`) VALUES
(1, '1', 12, 14),
(1, '2', 14, 14),
(1, '4', 10, 14),
(1, '5', 13, 14);

-- 10. Tabel grades (Nilai)
CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `mata_kuliah_id` varchar(50) NOT NULL,
  `uts` decimal(5,2) DEFAULT NULL,
  `uas` decimal(5,2) DEFAULT NULL,
  `final` decimal(5,2) DEFAULT NULL,
  `status` enum('DRAFT','FINAL') NOT NULL DEFAULT 'DRAFT',
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `grades` (`mahasiswa_id`, `mata_kuliah_id`, `uts`, `uas`, `final`, `status`, `updated_by`, `updated_at`) VALUES
(1, '1', 85.00, 90.00, NULL, 'DRAFT', 'Dr. Ir. Riza', '2026-05-05 09:00:00'),
(1, '2', 78.00, 82.00, NULL, 'DRAFT', 'Dr. Ir. Riza', '2026-05-05 09:15:00');

-- 11. Tabel log_audit
CREATE TABLE `log_audit` (
  `id` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL,
  `user` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `detail` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

INSERT INTO `log_audit` (`id`, `timestamp`, `user`, `action`, `detail`) VALUES
('l1', '2026-05-05 08:30:00', 'Dr. Ir. Riza', 'LOGIN', 'Berhasil login ke sistem'),
('l2', '2026-05-05 09:00:00', 'Dr. Ir. Riza', 'UPDATE_GRADE', 'Input UTS & UAS Budi Santoso (MK Algoritma)');

COMMIT;
