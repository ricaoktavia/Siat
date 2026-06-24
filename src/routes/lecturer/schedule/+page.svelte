<script lang="ts">
    import { 
        CalendarDays, 
        Clock, 
        MapPin, 
        Users, 
        Printer, 
        ChevronRight,
        BookOpen,
        ExternalLink,
        QrCode,
        X,
        RefreshCcw
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { toast } from '$lib/stores/toast';
    import { invalidateAll } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';

    let { data } = $props();

    let activeDay = $state('Senin');
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    // Auto refresh data every 5 seconds when QR Modal is open to simulate real-time
    let refreshInterval: any;
    $effect(() => {
        if (showQRModal) {
            refreshInterval = setInterval(() => {
                invalidateAll();
            }, 3000);
        } else {
            clearInterval(refreshInterval);
        }
        return () => clearInterval(refreshInterval);
    });

    let showQRModal = $state(false);
    let selectedCourse = $state<any>(null);

    function openQR(item: any) {
        selectedCourse = item;
        showQRModal = true;
    }

    let currentSchedule = $derived(data.teachingData[activeDay] || []);
    let currentStudents = $derived(selectedCourse ? data.attendanceByClass[selectedCourse.id] : []);
</script>

<svelte:head>
    <title>Jadwal Mengajar | SIAT Dosen</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 bg-slate-50">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <BookOpen class="w-7 h-7 mr-3 text-indigo-600" />
                Jadwal Mengajar
            </h1>
            <p class="text-sm text-slate-500 mt-1">Agenda perkuliahan yang Anda ampu pada semester ini.</p>
        </div>
        
        <div class="flex items-center space-x-3">
            <button class="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all">
                <Printer class="w-4 h-4 mr-2" />
                Cetak Agenda
            </button>
        </div>
    </div>

    <!-- Day Selector -->
    <div class="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex space-x-1 shrink-0 overflow-x-auto no-scrollbar">
        {#each days as day}
            <button 
                onclick={() => activeDay = day}
                class="flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200
                    {activeDay === day 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}"
            >
                {day}
            </button>
        {/each}
    </div>

    <!-- Teaching Timeline -->
    <div class="flex-1 space-y-4">
        {#if currentSchedule.length > 0}
            <div class="grid grid-cols-1 gap-4">
                {#each currentSchedule as item, i (item.id)}
                    <div 
                        in:fade={{ delay: i * 50 }}
                        class="bg-white rounded-3xl border border-slate-200 shadow-sm p-1 transition-all hover:shadow-lg hover:border-indigo-200 group flex flex-col md:flex-row"
                    >
                        <div class="md:w-48 bg-slate-50 p-6 flex flex-col justify-center items-center md:items-start md:border-r border-slate-100 shrink-0">
                            <div class="flex items-center text-indigo-600 font-bold text-lg mb-1">
                                <Clock class="w-4 h-4 mr-2" />
                                {item.waktu.split(' - ')[0]}
                            </div>
                            <div class="text-xs text-slate-400 font-medium uppercase tracking-widest">{item.waktu.split(' - ')[1]}</div>
                        </div>

                        <div class="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div class="space-y-1">
                                <div class="flex items-center space-x-3 mb-2">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                        Kelas {item.kelas}
                                    </span>
                                    <span class="text-xs text-slate-400 flex items-center">
                                        <Users class="w-3.5 h-3.5 mr-1.5" />
                                        {item.mahasiswa} Mahasiswa
                                    </span>
                                </div>
                                <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    {item.mk}
                                </h3>
                                <div class="flex items-center text-sm text-slate-500 mt-2">
                                    <MapPin class="w-4 h-4 mr-2 text-slate-400" />
                                    {item.ruang}
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                <button 
                                    onclick={() => openQR(item)}
                                    class="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-transparent hover:border-slate-200 hover:bg-white transition-all flex items-center"
                                >
                                    Presensi
                                    <QrCode class="w-4 h-4 ml-2" />
                                </button>
                                <button class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                                    <ChevronRight class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-inner">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays class="w-10 h-10 text-slate-200" />
                </div>
                <h3 class="text-lg font-bold text-slate-400 uppercase tracking-widest">Tidak Ada Jadwal Mengajar</h3>
                <p class="text-sm text-slate-400 mt-1">Hari ini Anda tidak memiliki jadwal perkuliahan.</p>
            </div>
        {/if}
    </div>
</div>

{#if showQRModal}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
        transition:fade
    >
        <div 
            class="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row"
            transition:scale={{ duration: 400, start: 0.9, opacity: 0 }}
        >
            <!-- Close Button -->
            <button 
                onclick={() => showQRModal = false}
                class="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all z-20"
            >
                <X class="w-5 h-5" />
            </button>

            <!-- LEFT: QR Code Section -->
            <div class="md:w-1/2 p-10 flex flex-col items-center text-center bg-slate-50/50 border-r border-slate-100">
                <div class="mb-6">
                    <span class="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        Presensi Digital
                    </span>
                    <h3 class="text-xl font-black text-slate-800 mt-4 leading-tight">
                        {selectedCourse?.mk}
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">{selectedCourse?.kelas} • {selectedCourse?.ruang}</p>
                </div>

                <div class="relative group">
                    <div class="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                    <div class="relative bg-white p-6 rounded-[3rem] border-2 border-slate-100 shadow-xl">
                        <div class="w-48 h-48 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <QrCode class="w-32 h-32 text-white opacity-20" />
                            <div class="absolute inset-0 flex flex-wrap p-2">
                                {#each Array(64) as _}
                                    <div class="w-[12.5%] h-[12.5%] p-0.5">
                                        <div class="w-full h-full {Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}"></div>
                                    </div>
                                {/each}
                            </div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="bg-white p-2 rounded-xl shadow-lg">
                                    <QrCode class="w-8 h-8 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 space-y-4 w-full">
                    <div class="flex items-center justify-center space-x-2 text-slate-400 text-xs">
                        <RefreshCcw class="w-3.5 h-3.5 animate-spin-slow" />
                        <span>Update otomatis dalam 24 detik</span>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Student List Section -->
            <div class="md:w-1/2 flex flex-col h-[500px] md:h-auto">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h4 class="font-bold text-slate-800 flex items-center">
                        <Users class="w-5 h-5 mr-2 text-indigo-600" />
                        Daftar Hadir Mahasiswa
                    </h4>
                    <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        {currentStudents.filter(s => s.hadir).length} / {currentStudents.length}
                    </span>
                </div>

                <div class="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                    {#each currentStudents as student, i}
                        <div class="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all group">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    {i + 1}
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-800">{student.name}</p>
                                    <p class="text-[9px] text-slate-400 font-mono">{student.nim}</p>
                                </div>
                            </div>
                            {#if student.hadir}
                                <span class="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100">Hadir</span>
                            {:else}
                                <span class="px-3 py-1 bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-400 rounded-lg">
                                    Belum Hadir
                                </span>
                            {/if}
                        </div>
                    {/each}
                </div>

                <div class="p-6 bg-slate-50 border-t border-slate-100">
                    <button 
                        onclick={() => toast.add('Laporan kehadiran berhasil diunduh!', 'success')}
                        class="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                        <Printer class="w-4 h-4 mr-2" />
                        Cetak Daftar Hadir (PDF)
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.animate-spin-slow) {
        animation: spin 3s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>
