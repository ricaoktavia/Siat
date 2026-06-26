<script lang="ts">
    import { 
        Users, 
        ClipboardCheck, 
        BookOpen, 
        TrendingUp, 
        ChevronRight,
        Calendar,
        Clock,
        FileText,
        MapPin
    } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';

    let { data } = $props();

    const stats = $derived([
        { label: 'Jumlah Mahasiswa', value: data?.totalStudents || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Menunggu Approval KRS', value: data?.pendingKrsCount || 0, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Mata Kuliah Diampu', value: data?.totalCourses || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Rata-rata IPK Mahasiswa', value: '3.78', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ]);

    const dayMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = dayMap[new Date().getDay()];

    let todaySchedule = $derived(
        (data.myClasses || [])
            .filter(c => c.waktu.startsWith(todayName))
            .map(c => {
                const parts = c.waktu.split(',');
                return {
                    time: parts[1] ? parts[1].trim() : c.waktu,
                    subject: c.mk,
                    room: 'Gedung A - R.201', // mock data
                    class: 'TI-A' // mock data
                };
            })
    );
</script>

<svelte:head>
    <title>Dashboard Dosen | SIAT</title>
</svelte:head>

<div class="h-full p-6 overflow-y-auto space-y-6 bg-slate-50">
    <!-- Welcome Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-800">Selamat Datang, Bapak Dosen!</h1>
            <p class="text-sm text-slate-500 mt-1">Berikut adalah ringkasan bimbingan dan jadwal mengajar Anda hari ini.</p>
        </div>
        <div class="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600">
            <Calendar class="w-4 h-4 text-blue-500" />
            <span>Selasa, 5 Mei 2026</span>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each stats as stat}
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center group hover:shadow-md transition-shadow">
                <div class="p-3 rounded-xl {stat.bg} {stat.color} mr-4 transition-transform group-hover:scale-110">
                    <stat.icon class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p class="text-2xl font-black text-slate-800">{stat.value}</p>
                </div>
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Column -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Pending KRS Submissions -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center">
                        <ClipboardCheck class="w-5 h-5 mr-2 text-amber-500" />
                        Antrean Review KRS
                    </h3>
                    <a href="/lecturer/krs-review" class="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</a>
                </div>
                <div class="p-0">
                    <div class="divide-y divide-slate-50">
                        {#each data.pendingKrs || [] as student}
                        <div class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer" onclick={() => window.location.href='/lecturer/krs-review'}>
                            <div class="flex items-center space-x-4">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed={student.name}&backgroundColor=e2e8f0" alt="Student" class="w-10 h-10 rounded-full">
                                <div>
                                    <p class="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{student.name}</p>
                                    <p class="text-xs text-slate-500">{student.nim} • {student.prodi}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="text-right">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase">Total SKS</p>
                                    <p class="text-sm font-bold text-slate-700">{student.totalSks} SKS</p>
                                </div>
                                <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </div>
                        </div>
                        {/each}
                        {#if !data.pendingKrs || data.pendingKrs.length === 0}
                        <div class="p-6 text-center text-slate-500 text-sm">
                            Tidak ada antrean review KRS.
                        </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/lecturer/grades" class="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95">
                    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <FileText class="w-12 h-12 mb-6 text-indigo-200" />
                    <h3 class="text-xl font-black mb-2">Input Nilai Mahasiswa</h3>
                    <p class="text-indigo-100/80 text-sm leading-relaxed">
                        Masukkan nilai UTS, UAS, dan final dengan sistem Maker-Checker yang aman.
                    </p>
                    <div class="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                        Buka Menu Nilai
                        <ChevronRight class="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                </a>

                <a href="/lecturer/schedule" class="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95">
                    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <Calendar class="w-12 h-12 mb-6 text-blue-400" />
                    <h3 class="text-xl font-black mb-2">Jadwal & Presensi</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        Lihat agenda mengajar dan buka QR Code presensi untuk mahasiswa hari ini.
                    </p>
                    <div class="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                        Lihat Jadwal
                        <ChevronRight class="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                </a>
            </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
            <!-- Today's Teaching -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center">
                        <Clock class="w-5 h-5 mr-2 text-indigo-500" />
                        Mengajar Hari Ini
                    </h3>
                </div>
                <div class="p-5 space-y-4">
                    {#if todaySchedule.length > 0}
                        {#each todaySchedule as item}
                            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                <p class="text-xs font-bold text-blue-600 mb-1">{item.time}</p>
                                <h4 class="text-sm font-bold text-slate-800">{item.subject}</h4>
                                <div class="flex items-center justify-between mt-3">
                                    <span class="text-xs text-slate-500 flex items-center">
                                        <MapPin class="w-3.5 h-3.5 mr-1" />
                                        {item.room}
                                    </span>
                                    <span class="text-[10px] font-black px-2 py-0.5 bg-slate-200 text-slate-700 rounded uppercase tracking-wider">
                                        {item.class}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="py-8 flex flex-col items-center justify-center text-center">
                            <Clock class="w-8 h-8 text-slate-300 mb-3" />
                            <p class="text-sm font-bold text-slate-500">Tidak Ada Jadwal</p>
                            <p class="text-xs text-slate-400 mt-1">Anda sedang tidak memiliki jadwal<br>mengajar untuk hari ini.</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
