<script lang="ts">
    import { 
        UserCheck, 
        AlertTriangle, 
        CheckCircle2, 
        Calendar, 
        BookOpen,
        ArrowUpRight,
        Info,
        QrCode,
        Scan,
        X,
        Maximize,
        Camera
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data, form } = $props();

    const threshold = 75;
    let isScannerOpen = $state(false);
    let isScanning = $state(false);

    function startScan() {
        isScannerOpen = true;
        isScanning = true;
    }

    let showSuccess = $state(false);
    $effect(() => {
        if (form?.success) {
            showSuccess = true;
            isScannerOpen = false;
            const timer = setTimeout(() => showSuccess = false, 5000);
            return () => clearTimeout(timer);
        }
    });
</script>

<svelte:head>
    <title>Kehadiran & Presensi | SIAT</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 bg-slate-50 relative">
    
    <!-- Success Toast -->
    {#if showSuccess}
        <div class="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center" transition:scale>
            <CheckCircle2 class="w-5 h-5 mr-3" />
            <span class="font-bold">{form?.message}</span>
        </div>
    {/if}

    <div class="flex items-center justify-between shrink-0">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <UserCheck class="w-7 h-7 mr-3 text-emerald-600" />
                Rekap Kehadiran Kuliah
            </h1>
            <p class="text-sm text-slate-500 mt-1">Pantau persentase kehadiran Anda untuk syarat kelayakan UAS.</p>
        </div>
        
        <button 
            onclick={startScan}
            class="flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all"
        >
            <Scan class="w-5 h-5 mr-2" />
            Scan QR Absensi
        </button>
    </div>

    <!-- Alert for low attendance -->
    {#if data.presensi.some(p => p.persentase < threshold)}
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-800" transition:slide>
            <AlertTriangle class="w-6 h-6 shrink-0 text-amber-500" />
            <div>
                <p class="font-bold">Peringatan Kehadiran Rendah!</p>
                <p class="text-sm opacity-90">Ada mata kuliah dengan kehadiran di bawah {threshold}%. Segera hubungi dosen pengampu atau perbaiki kehadiran Anda agar tetap bisa mengikuti UAS.</p>
            </div>
        </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {#each data.presensi as item}
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-emerald-200 hover:shadow-md transition-all" in:fade>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <BookOpen class="w-6 h-6" />
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.nama}</h3>
                                <p class="text-xs text-slate-400 font-mono mt-0.5">{item.kode}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-2xl font-black {item.persentase < threshold ? 'text-rose-500' : 'text-emerald-600'}">
                                {item.persentase}%
                            </span>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Kehadiran</p>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="space-y-2 mb-6">
                        <div class="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                            <span>Progress Pertemuan</span>
                            <span>{item.hadir} / {item.total} Sesi</span>
                        </div>
                        <div class="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                                class="h-full transition-all duration-1000 ease-out {item.persentase < threshold ? 'bg-rose-500' : 'bg-emerald-500'}"
                                style="width: {item.persentase}%"
                            ></div>
                            <div class="h-full bg-slate-200/50" style="width: {100 - item.persentase}%"></div>
                        </div>
                        <div class="flex justify-between">
                             <div class="flex items-center text-[10px] text-slate-400">
                                <Info class="w-3 h-3 mr-1" />
                                Minimal {threshold}% untuk UAS
                             </div>
                             {#if item.persentase >= threshold}
                                <div class="flex items-center text-[10px] text-emerald-600 font-bold">
                                    <CheckCircle2 class="w-3 h-3 mr-1" />
                                    Layak UAS
                                </div>
                             {:else}
                                <div class="flex items-center text-[10px] text-rose-500 font-bold">
                                    <AlertTriangle class="w-3 h-3 mr-1" />
                                    Tidak Layak UAS
                                </div>
                             {/if}
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-4 border-t border-slate-50">
                        <button class="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center">
                            Lihat Detail Sesi
                            <ArrowUpRight class="w-3 h-3 ml-1" />
                        </button>
                        <span class="text-[10px] text-slate-300">Terakhir Update: Hari ini, 09:42</span>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<!-- QR SCANNER SIMULATION MODAL -->
{#if isScannerOpen}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
        transition:fade
    >
        <div class="w-full max-w-lg flex flex-col items-center">
            <div class="relative w-full aspect-square max-w-[400px] bg-slate-800 rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl">
                <!-- Camera Simulation Background -->
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-900 flex items-center justify-center">
                    <Camera class="w-20 h-20 text-white/5 animate-pulse" />
                </div>

                <!-- Scanner Overlays -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="w-64 h-64 border-2 border-white/20 rounded-3xl relative">
                        <!-- Corners -->
                        <div class="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                        <div class="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                        <div class="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                        <div class="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                        
                        <!-- Scanning Line -->
                        <div class="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan"></div>
                    </div>
                    
                    <p class="text-white/60 text-sm mt-8 font-medium tracking-wide">Posisikan QR Code di dalam kotak</p>
                </div>

                <!-- Top Controls -->
                <div class="absolute top-6 left-6 right-6 flex justify-between">
                    <div class="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white">
                        <Maximize class="w-5 h-5" />
                    </div>
                    <button 
                        onclick={() => isScannerOpen = false}
                        class="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-rose-500 transition-colors"
                    >
                        <X class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Scanner Footer -->
            <div class="mt-10 w-full grid grid-cols-1 gap-4 px-6">
                <p class="text-white/40 text-xs text-center mb-4">Simulasi: Pilih mata kuliah untuk diabsen via QR</p>
                <div class="grid grid-cols-2 gap-3">
                    {#each data.presensi as item}
                        <form method="POST" action="?/markAttendance" use:enhance>
                            <input type="hidden" name="kode" value={item.kode} />
                            <button 
                                type="submit"
                                class="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold transition-all"
                            >
                                {item.nama}
                            </button>
                        </form>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes scan {
        0%, 100% { top: 0%; }
        50% { top: 100%; }
    }
    .animate-scan {
        animation: scan 3s infinite ease-in-out;
        position: absolute;
    }
</style>
