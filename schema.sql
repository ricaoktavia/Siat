CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mahasiswa_id` int NOT NULL,
	`mata_kuliah_id` varchar(50) NOT NULL,
	`uts` decimal(5,2),
	`uas` decimal(5,2),
	`final` decimal(5,2),
	`status` enum('DRAFT','FINAL') NOT NULL DEFAULT 'DRAFT',
	`updated_by` varchar(100),
	`updated_at` datetime,
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);

CREATE TABLE `kelas_kuliah` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mata_kuliah_id` varchar(50) NOT NULL,
	`dosen_utama` varchar(100) NOT NULL,
	`jadwal` varchar(50) NOT NULL,
	`kuota_maksimal` int NOT NULL,
	`sisa_kuota` int NOT NULL,
	CONSTRAINT `kelas_kuliah_id` PRIMARY KEY(`id`)
);

CREATE TABLE `krs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mahasiswa_id` int NOT NULL,
	`periode_akademik` varchar(20) NOT NULL,
	`status` enum('DRAFT','DIAJUKAN','DISETUJUI','DITOLAK') NOT NULL DEFAULT 'DRAFT',
	`rejection_reason` text,
	CONSTRAINT `krs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `krs_detail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`krs_id` int NOT NULL,
	`course_id` varchar(50) NOT NULL,
	CONSTRAINT `krs_detail_id` PRIMARY KEY(`id`)
);

CREATE TABLE `log_audit` (
	`id` varchar(50) NOT NULL,
	`timestamp` datetime NOT NULL,
	`user` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`detail` text NOT NULL,
	CONSTRAINT `log_audit_id` PRIMARY KEY(`id`)
);

CREATE TABLE `mahasiswa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`nim` varchar(20) NOT NULL,
	`prodi` varchar(50) NOT NULL,
	`ipk` decimal(3,2) NOT NULL DEFAULT '0.00',
	`semester` int NOT NULL DEFAULT 1,
	`pembimbing_akademik_id` varchar(50),
	`nik` varchar(20),
	`tempat_lahir` varchar(50),
	`tanggal_lahir` varchar(50),
	`jenis_kelamin` varchar(20),
	`agama` varchar(20),
	`kewarganegaraan` varchar(20),
	`golongan_darah` varchar(5),
	`email` varchar(100),
	`email_pribadi` varchar(100),
	`no_hp` varchar(20),
	`alamat_asal` text,
	`alamat_domisili` text,
	`nama_ayah` varchar(100),
	`pekerjaan_ayah` varchar(100),
	`nama_ibu` varchar(100),
	`pekerjaan_ibu` varchar(100),
	`no_telepon_darurat` varchar(20),
	CONSTRAINT `mahasiswa_id` PRIMARY KEY(`id`),
	CONSTRAINT `mahasiswa_nim_unique` UNIQUE(`nim`)
);

CREATE TABLE `mata_kuliah` (
	`id` varchar(50) NOT NULL,
	`kode` varchar(10) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`sks` int NOT NULL,
	CONSTRAINT `mata_kuliah_id` PRIMARY KEY(`id`),
	CONSTRAINT `mata_kuliah_kode_unique` UNIQUE(`kode`)
);

CREATE TABLE `mata_kuliah_prasyarat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mata_kuliah_id` varchar(50) NOT NULL,
	`prasyarat_kode` varchar(10) NOT NULL,
	CONSTRAINT `mata_kuliah_prasyarat_id` PRIMARY KEY(`id`)
);

CREATE TABLE `presensi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mahasiswa_id` int NOT NULL,
	`mata_kuliah_id` varchar(50) NOT NULL,
	`hadir` int NOT NULL DEFAULT 0,
	`total_pertemuan` int NOT NULL DEFAULT 14,
	CONSTRAINT `presensi_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ukt_keuangan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mahasiswa_id` int NOT NULL,
	`semester` varchar(20) NOT NULL,
	`jumlah` decimal(15,2) NOT NULL,
	`deadline` varchar(50) NOT NULL,
	`virtual_account` varchar(30) NOT NULL,
	`status` enum('BELUM_BAYAR','LUNAS') NOT NULL DEFAULT 'BELUM_BAYAR',
	CONSTRAINT `ukt_keuangan_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
	`id` varchar(50) NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('STUDENT','LECTURER','ADMIN') NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);

ALTER TABLE `grades` ADD CONSTRAINT `grades_mahasiswa_id_mahasiswa_id_fk` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `grades` ADD CONSTRAINT `grades_mata_kuliah_id_mata_kuliah_id_fk` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `kelas_kuliah` ADD CONSTRAINT `kelas_kuliah_mata_kuliah_id_mata_kuliah_id_fk` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `krs` ADD CONSTRAINT `krs_mahasiswa_id_mahasiswa_id_fk` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `krs_detail` ADD CONSTRAINT `krs_detail_krs_id_krs_id_fk` FOREIGN KEY (`krs_id`) REFERENCES `krs`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `krs_detail` ADD CONSTRAINT `krs_detail_course_id_mata_kuliah_id_fk` FOREIGN KEY (`course_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `mata_kuliah_prasyarat` ADD CONSTRAINT `mata_kuliah_prasyarat_mata_kuliah_id_mata_kuliah_id_fk` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `presensi` ADD CONSTRAINT `presensi_mahasiswa_id_mahasiswa_id_fk` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `presensi` ADD CONSTRAINT `presensi_mata_kuliah_id_mata_kuliah_id_fk` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `ukt_keuangan` ADD CONSTRAINT `ukt_keuangan_mahasiswa_id_mahasiswa_id_fk` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE cascade ON UPDATE no action;
