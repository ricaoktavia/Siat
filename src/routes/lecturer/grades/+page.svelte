<script lang="ts">
    import { 
        FileText, 
        Users, 
        Save, 
        Lock, 
        CheckCircle2, 
        AlertCircle, 
        History,
        Search,
        ChevronRight,
        ShieldCheck,
        RotateCcw
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data, form } = $props();

    let selectedCourseId = $state(data.courses[0]?.id);
    let searchQuery = $state('');

    let filteredGrades = $derived(
        data.grades.filter(g => 
            g.courseId === selectedCourseId && 
            ((g.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) || g.nim.includes(searchQuery))
        )
    );

    let showLog = $state(false);

    // Auto-hide toast
    let toastVisible = $state(false);
    $effect(() => {
        if (form) {
            toastVisible = true;
            const timer = setTimeout(() => toastVisible = false, 5000);
            return () => clearTimeout(timer);
        }
    });

    function getStatusClass(status: string) {
        if (status === 'FINAL') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
</script>

<svelte:head>
    <title>Input Nilai Mahasiswa | SIAT Dosen</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 bg-slate-50">
    <!-- Toast Notification -->
    {#if toastVisible && form}
        <div 
            class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 rounded-2xl shadow-2xl border min-w-[300px] {form.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}"
            transition:scale
        >
            {#if form.error}
                <AlertCircle class="w-5 h-5 mr-3" />
            {:else}
                <CheckCircle2 class="w-5 h-5 mr-3" />
            {/if}
            <p class="text-sm font-bold">{form.message}</p>
        </div>
    {/if}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <FileText class="w-7 h-7 mr-3 text-indigo-600" />
                Input Nilai Mahasiswa
            </h1>
            <p class="text-sm text-slate-500 mt-1">Gunakan sistem Maker-Checker untuk memastikan validitas nilai.</p>
        </div>
        
        <button 
            onclick={() => showLog = !showLog}
            class="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
            <History class="w-4 h-4 mr-2" />
            Audit Logs
        </button>
    </div>

    <!-- Audit Log Overlay -->
    {#if showLog}
        <div class="p-6 bg-slate-900 text-slate-300 rounded-3xl shadow-2xl border border-white/10" transition:slide>
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold flex items-center text-white">
                    <ShieldCheck class="w-5 h-5 mr-2 text-emerald-400" />
                    Log Keamanan & Audit (Maker-Checker)
                </h3>
                <button onclick={() => showLog = false} class="text-xs hover:text-white uppercase font-bold tracking-widest">Tutup</button>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar text-[11px] font-mono">
                {#each data.logs as log}
                    <div class="flex items-start space-x-3 py-2 border-b border-white/5">
                        <span class="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span class="text-blue-400 shrink-0">{log.action}</span>
                        <span class="text-slate-400">{log.detail}</span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <!-- Sidebar: Course List -->
        <div class="lg:col-span-1 space-y-4">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Mata Kuliah Diampu</h3>
            <div class="space-y-2">
                {#each data.courses as course}
                    <button 
                        onclick={() => selectedCourseId = course.id}
                        class="w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1
                            {selectedCourseId === course.id 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30'}"
                    >
                        <p class="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{course.kode}</p>
                        <p class="text-sm font-black leading-snug">{course.nama}</p>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Main: Student Grading List -->
        <div class="lg:col-span-3 space-y-4">
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                <div class="relative w-64">
                    <Search class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        bind:value={searchQuery}
                        placeholder="Cari NIM atau Nama..." 
                        class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    >
                </div>
                <div class="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Users class="w-4 h-4 mr-2" />
                    {filteredGrades.length} Mahasiswa
                </div>
            </div>

            <div class="space-y-3">
                {#each filteredGrades as g (g.nim + g.courseId)}
                    <form 
                        method="POST" 
                        action="?/updateGrade" 
                        use:enhance
                        class="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center gap-6"
                    >
                        <input type="hidden" name="nim" value={g.nim} />
                        <input type="hidden" name="courseId" value={g.courseId} />
                        
                        <div class="flex-1 flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 font-bold border border-slate-100">
                                {g.studentName?.charAt(0) || '?'}
                            </div>
                            <div>
                                <p class="text-base font-black text-slate-800">{g.studentName || 'Unknown Student'}</p>
                                <p class="text-xs text-slate-400 font-mono tracking-tight">{g.nim}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:items-center">
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">UTS (40%)</label>
                                <input 
                                    type="number" 
                                    name="uts"
                                    value={g.uts} 
                                    disabled={g.status === 'FINAL'}
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                >
                            </div>
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">UAS (60%)</label>
                                <input 
                                    type="number" 
                                    name="uas"
                                    value={g.uas} 
                                    disabled={g.status === 'FINAL'}
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                >
                            </div>
                            <div class="text-center">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Akhir</p>
                                <p class="text-xl font-black {g.status === 'FINAL' ? 'text-indigo-600' : 'text-slate-200'}">
                                    {g.final ?? '-'}
                                </p>
                            </div>
                            <div class="text-center">
                                <span class="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border {getStatusClass(g.status)}">
                                    {g.status}
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center space-x-2 shrink-0">
                            {#if g.status === 'DRAFT'}
                                <button 
                                    type="submit" 
                                    class="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                                    title="Simpan Draft"
                                >
                                    <Save class="w-5 h-5" />
                                </button>
                                <button 
                                    type="submit"
                                    name="finalize"
                                    value="true"
                                    class="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all border border-transparent"
                                    title="Kunci Nilai (Finalize)"
                                >
                                    <Lock class="w-5 h-5" />
                                </button>
                            {:else}
                                <button 
                                    type="submit"
                                    formaction="?/unlockGrade"
                                    class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all flex items-center font-bold text-xs group"
                                    title="Buka Kunci (Unlock)"
                                >
                                    <CheckCircle2 class="w-5 h-5 mr-2 group-hover:hidden" />
                                    <RotateCcw class="w-5 h-5 mr-2 hidden group-hover:block" />
                                    Terkunci
                                </button>
                            {/if}
                        </div>
                    </form>
                {/each}

                {#if filteredGrades.length === 0}
                    <div class="py-20 text-center flex flex-col items-center bg-white rounded-[3rem] border border-slate-100">
                        <AlertCircle class="w-12 h-12 text-slate-100 mb-4" />
                        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak Ada Data Mahasiswa</p>
                    </div>
                {/if}
            </div>
            
            <div class="p-6 bg-slate-100/50 rounded-3xl text-[10px] text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p>⚠️ <strong>Maker-Checker Policy:</strong> Setiap perubahan nilai dicatat dalam audit logs sistem bersama dengan alamat IP dan stempel waktu.</p>
                <div class="flex items-center space-x-4">
                    <span>IP: 192.168.1.42</span>
                    <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span class="text-emerald-600 font-bold uppercase tracking-tighter">Secure Session Active</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }
</style>
