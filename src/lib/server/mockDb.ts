export interface User {
    id: string;
    username: string; // NIM for student, NIDN for lecturer
    password: string;
    role: 'STUDENT' | 'LECTURER';
    name: string;
}

export interface Student {
    nim: string;
    name: string;
    ipk: number;
    passedCourses: string[]; 
}

export interface Course {
    id: string;
    kode: string;
    nama: string;
    sks: number;
    dosen: string;
    jadwal: string;
    kuota: number;
    sisa: number;
    prerequisites: string[];
}

export interface KrsState {
    status: 'DRAFT' | 'DIAJUKAN' | 'DISETUJUI' | 'DITOLAK';
    drafts: { courseId: string }[];
    rejectionReason?: string;
}

// In-Memory Database Simulation
export const db = {
    users: [
        { id: 'u1', username: '210101001', password: 'password123', role: 'STUDENT', name: 'Budi Santoso' },
        { id: 'u2', username: '19850101', password: 'password123', role: 'LECTURER', name: 'Dr. Ir. Riza, M.T.' }
    ] as User[],

    currentSession: null as User | null,

    currentStudent: {
        nim: '210101001',
        name: 'Budi Santoso',
        ipk: 3.15,
        passedCourses: ['IF1101', 'IF2101']
    } as Student,

    catalog: [
        { id: '1', kode: 'IF3101', nama: 'Desain dan Analisis Algoritma', sks: 3, dosen: 'Dr. Ir. Riza', jadwal: 'Senin, 08:00 - 10:30', kuota: 40, sisa: 15, prerequisites: ['IF1101'] },
        { id: '2', kode: 'IF3102', nama: 'Pemrograman Web Lanjut', sks: 3, dosen: 'Budi Raharjo, M.Kom', jadwal: 'Selasa, 13:00 - 15:30', kuota: 40, sisa: 3, prerequisites: ['IF2101'] },
        { id: '3', kode: 'IF3103', nama: 'Kecerdasan Buatan', sks: 3, dosen: 'Dr. Ayu Lestari', jadwal: 'Rabu, 08:00 - 10:30', kuota: 30, sisa: 0, prerequisites: [] },
        { id: '4', kode: 'IF3104', nama: 'Sistem Basis Data', sks: 4, dosen: 'Prof. Hasanuddin', jadwal: 'Kamis, 08:00 - 11:20', kuota: 40, sisa: 20, prerequisites: [] },
        { id: '5', kode: 'IF3105', nama: 'Jaringan Komputer', sks: 3, dosen: 'Doni Pratama, M.T.', jadwal: 'Jumat, 13:00 - 15:30', kuota: 30, sisa: 1, prerequisites: [] }
    ] as Course[],

    krs: {
        status: 'DRAFT',
        drafts: []
    } as KrsState,

    // NEW: Financial Data
    uktStatus: 'BELUM_BAYAR', // BELUM_BAYAR or LUNAS
    uktBilling: {
        semester: 'Ganjil 2026/2027',
        jumlah: 5000000,
        deadline: '10 Agustus 2026',
        virtualAccount: '8801210101001'
    },

    // NEW: Attendance Data
    presensi: [
        { kode: 'IF3101', nama: 'Desain dan Analisis Algoritma', hadir: 12, total: 14, persentase: 85.7 },
        { kode: 'IF3102', nama: 'Pemrograman Web Lanjut', hadir: 14, total: 14, persentase: 100 },
        { kode: 'IF3104', nama: 'Sistem Basis Data', hadir: 10, total: 14, persentase: 71.4 },
        { kode: 'IF3105', nama: 'Jaringan Komputer', hadir: 13, total: 14, persentase: 92.8 }
    ],

    // NEW: Full Transcript Data
    transcript: [
        { semester: 1, gpa: 3.85, courses: [
            { kode: 'MK101', nama: 'Matematika Dasar', sks: 3, nilai: 'A', angka: 4.0 },
            { kode: 'MK102', nama: 'Bahasa Inggris', sks: 2, nilai: 'A-', angka: 3.7 }
        ]},
        { semester: 2, gpa: 3.90, courses: [
            { kode: 'MK201', nama: 'Struktur Data', sks: 3, nilai: 'A', angka: 4.0 },
            { kode: 'MK202', nama: 'Algoritma Pemrograman', sks: 3, nilai: 'A', angka: 4.0 }
        ]},
        { semester: 3, gpa: 3.70, courses: [
            { kode: 'MK301', nama: 'Arsitektur Komputer', sks: 3, nilai: 'B+', angka: 3.3 },
            { kode: 'MK302', nama: 'Sistem Operasi', sks: 3, nilai: 'A', angka: 4.0 }
        ]},
        { semester: 4, gpa: 3.82, courses: [
            { kode: 'MK401', nama: 'Metode Numerik', sks: 3, nilai: 'A', angka: 4.0 },
            { kode: 'MK402', nama: 'Rekayasa Perangkat Lunak', sks: 3, nilai: 'B', angka: 3.0 }
        ]}
    ],

    // Lecturer specific data
    mentoredStudents: [
        { nim: '210101001', name: 'Budi Santoso', prodi: 'Teknik Informatika', semester: 5, ipk: 3.15 }
    ],

    krsReviewQueue: [
        { 
            nim: '210101045', 
            name: 'Ani Wijaya', 
            prodi: 'Teknik Informatika', 
            status: 'DIAJUKAN', 
            ipk: 3.82,
            totalSks: 21,
            courses: [
                { kode: 'IF3101', nama: 'Desain dan Analisis Algoritma', sks: 3 },
                { kode: 'IF3102', nama: 'Pemrograman Web Lanjut', sks: 3 },
                { kode: 'IF3104', nama: 'Sistem Basis Data', sks: 4 }
            ]
        },
        { 
            nim: '210101088', 
            name: 'Dedi Kurniawan', 
            prodi: 'Sistem Informasi', 
            status: 'DIAJUKAN', 
            ipk: 2.95,
            totalSks: 18,
            courses: [
                { kode: 'IF3101', nama: 'Desain dan Analisis Algoritma', sks: 3 },
                { kode: 'IF3105', nama: 'Jaringan Komputer', sks: 3 }
            ]
        }
    ],

    // NEW: Grading Data (Maker-Checker Simulation)
    studentsGrades: [
        { nim: '210101001', courseId: '1', uts: 85, uas: 90, final: null as number | null, status: 'DRAFT', updatedBy: 'Dr. Ir. Riza', updatedAt: '2026-05-05 09:00' },
        { nim: '210101001', courseId: '2', uts: 78, uas: 82, final: null as number | null, status: 'DRAFT', updatedBy: 'Dr. Ir. Riza', updatedAt: '2026-05-05 09:15' }
    ],

    // NEW: Security & Audit Logs
    auditLogs: [
        { id: 'l1', timestamp: '2026-05-05 08:30', user: 'Dr. Ir. Riza', action: 'LOGIN', detail: 'Berhasil login ke sistem' },
        { id: 'l2', timestamp: '2026-05-05 09:00', user: 'Dr. Ir. Riza', action: 'UPDATE_GRADE', detail: 'Input UTS & UAS Budi Santoso (MK Algoritma)' }
    ]
};

export function getMaxSks(ipk: number): number {
    if (ipk >= 3.0) return 24;
    if (ipk >= 2.5) return 21;
    if (ipk >= 2.0) return 18;
    return 15;
}
