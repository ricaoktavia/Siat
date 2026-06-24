<script lang="ts">
    import { 
        CalendarDays, 
        Clock, 
        MapPin, 
        User, 
        Printer, 
        Share2,
        ChevronRight,
        AlertCircle,
        BookOpen
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { toast } from '$lib/stores/toast';

    // State for selected day
    let activeDay = $state('Senin');
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    // Dummy Data
    const scheduleData = {
        'Senin': [
            { id: 1, mk: 'Desain dan Analisis Algoritma', waktu: '08:00 - 10:30', ruang: 'Gedung A - R.201', dosen: 'Dr. Ir. Riza', tipe: 'Teori' },
            { id: 2, mk: 'Pendidikan Pancasila', waktu: '13:00 - 14:40', ruang: 'Gedung B - R.105', dosen: 'Drs. Supriyanto', tipe: 'Teori' }
        ],
        'Selasa': [
            { id: 3, mk: 'Pemrograman Web Lanjut', waktu: '13:00 - 15:30', ruang: 'Lab Komputer 3', dosen: 'Budi Raharjo, M.Kom', tipe: 'Praktikum' },
            { id: 4, mk: 'Interaksi Manusia dan Komputer', waktu: '15:40 - 18:10', ruang: 'Lab Komputer 1', dosen: 'Siti Aminah, M.Ds.', tipe: 'Praktikum' }
        ],
        'Rabu': [
            { id: 5, mk: 'Kecerdasan Buatan', waktu: '08:00 - 10:30', ruang: 'Gedung A - R.302', dosen: 'Dr. Ayu Lestari', tipe: 'Teori' }
        ],
        'Kamis': [
            { id: 6, mk: 'Sistem Basis Data', waktu: '08:00 - 11:20', ruang: 'Lab Komputer 2', dosen: 'Prof. Hasanuddin', tipe: 'Teori' }
        ],
        'Jumat': [
            { id: 7, mk: 'Jaringan Komputer', waktu: '13:00 - 15:30', ruang: 'Lab Komputer 4', dosen: 'Doni Pratama, M.T.', tipe: 'Praktikum' }
        ]
    };

    let currentSchedule = $derived(scheduleData[activeDay as keyof typeof scheduleData] || []);

    function getTipeColor(tipe: string) {
        return tipe === 'Praktikum' 
            ? 'text-indigo-600 bg-indigo-50 border-indigo-100' 
            : 'text-blue-600 bg-blue-50 border-blue-100';
    }
</script>

<svelte:head>
    <title>Jadwal Kuliah | SIAT</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 scroll-smooth bg-slate-50">
    
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <CalendarDays class="w-7 h-7 mr-3 text-blue-600" />
                Jadwal Kuliah Mingguan
            </h1>
            <p class="text-sm text-slate-500 mt-1">Lihat dan kelola agenda perkuliahan Anda dalam satu minggu.</p>
        </div>
        
        <div class="flex items-center space-x-3">
            <button 
                onclick={() => toast.add('Link jadwal berhasil disalin ke clipboard!', 'success')}
                class="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
            >
                <Share2 class="w-4 h-4 mr-2" />
                Bagikan
            </button>
            <button 
                onclick={() => window.print()}
                class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm hover:shadow-blue-500/30 transition-all"
            >
                <Printer class="w-4 h-4 mr-2" />
                Cetak Jadwal
            </button>
        </div>
    </div>

    <!-- Day Selector (Tabs) -->
    <div class="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex space-x-1 shrink-0 overflow-x-auto no-scrollbar">
        {#each days as day}
            <button 
                onclick={() => activeDay = day}
                class="flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200
                    {activeDay === day 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}"
            >
                {day}
            </button>
        {/each}
    </div>

    <!-- Schedule Timeline -->
    <div class="flex-1 space-y-4">
        {#if currentSchedule.length > 0}
            <div class="grid grid-cols-1 gap-4">
                {#each currentSchedule as item, i (item.id)}
                    <div 
                        in:fade={{ delay: i * 50, duration: 300 }}
                        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 transition-all hover:shadow-md hover:border-blue-200 group flex flex-col md:flex-row overflow-hidden"
                    >
                        <!-- Time Side Area -->
                        <div class="md:w-48 bg-slate-50 p-6 flex flex-col justify-center items-center md:items-start md:border-r border-slate-100 shrink-0">
                            <div class="flex items-center text-blue-600 font-bold text-lg mb-1">
                                <Clock class="w-4 h-4 mr-2" />
                                {item.waktu.split(' - ')[0]}
                            </div>
                            <div class="text-xs text-slate-400 font-medium uppercase tracking-widest">Sampai {item.waktu.split(' - ')[1]}</div>
                        </div>

                        <!-- Info Content Area -->
                        <div class="flex-1 p-6 relative">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div class="space-y-1">
                                    <div class="flex items-center space-x-3 mb-2">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border {getTipeColor(item.tipe)}">
                                            {item.tipe}
                                        </span>
                                        <span class="text-xs text-slate-400 font-medium">#{item.id}00-K</span>
                                    </div>
                                    <h3 class="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                                        {item.mk}
                                    </h3>
                                    <div class="flex flex-wrap gap-y-2 gap-x-6 pt-2">
                                        <div class="flex items-center text-sm text-slate-600">
                                            <User class="w-4 h-4 mr-2 text-slate-400" />
                                            {item.dosen}
                                        </div>
                                        <div class="flex items-center text-sm text-slate-600">
                                            <MapPin class="w-4 h-4 mr-2 text-slate-400" />
                                            {item.ruang}
                                        </div>
                                    </div>
                                </div>
                                
                                <button class="flex items-center justify-center p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                                    <ChevronRight class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-inner" in:fade>
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays class="w-10 h-10 text-slate-200" />
                </div>
                <h3 class="text-lg font-bold text-slate-400">Tidak ada jadwal kuliah</h3>
                <p class="text-sm text-slate-400 mt-1">Hari ini adalah waktu untuk istirahat atau belajar mandiri.</p>
            </div>
        {/if}
    </div>

    <!-- Footer Info -->
    <div class="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200 shrink-0">
        <div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start space-x-4">
                <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle class="w-6 h-6" />
                </div>
                <div>
                    <h4 class="font-bold text-lg">Informasi Akademik</h4>
                    <p class="text-indigo-100 text-sm max-w-xl">
                        Pastikan Anda hadir 15 menit sebelum perkuliahan dimulai. Perubahan jadwal sewaktu-waktu akan diinformasikan melalui notifikasi sistem dan grup koordinasi mata kuliah.
                    </p>
                </div>
            </div>
            <button 
                onclick={() => toast.add('Mengalihkan ke layanan akademik...', 'info')}
                class="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-md"
            >
                Hubungi Akademik
            </button>
        </div>
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
