<script lang="ts">
    import { 
        ClipboardCheck, 
        CheckCircle2, 
        XCircle, 
        AlertCircle, 
        Info, 
        FileText, 
        ChevronDown, 
        ExternalLink, 
        MessageSquare, 
        RotateCcw 
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data, form } = $props();
    
    let selectedStudent = $state<any>(null);
    let rejectionReason = $state('');
    let returnNote = $state('');
    let showRejectModal = $state(false);
    let showReturnModal = $state(false);

    function getStatusClass(status: string) {
        switch (status) {
            case 'DIAJUKAN': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DISETUJUI': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'DITOLAK': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'REVISI': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }
</script>

<svelte:head>
    <title>Review KRS | SIAT Dosen</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-hidden bg-slate-50 space-y-6">
    <div class="shrink-0">
        <h1 class="text-2xl font-bold text-slate-800 flex items-center">
            <ClipboardCheck class="w-7 h-7 mr-3 text-indigo-600" />
            Review Pengajuan KRS
        </h1>
        <p class="text-sm text-slate-500 mt-1">Lakukan verifikasi dan persetujuan terhadap draf KRS mahasiswa bimbingan Anda.</p>
    </div>

    {#if data.submittedStudents.length === 0}
        <div class="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-inner">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 class="w-10 h-10 text-slate-200" />
            </div>
            <h3 class="text-lg font-bold text-slate-400">Antrean Kosong</h3>
            <p class="text-sm text-slate-400 mt-1">Belum ada mahasiswa yang mengajukan KRS saat ini.</p>
        </div>
    {:else}
        <div class="flex-1 flex gap-6 overflow-hidden">
            <!-- Sidebar List Mahasiswa -->
            <div class="w-80 flex flex-col space-y-3 overflow-y-auto pr-2">
                {#each data.submittedStudents as student}
                    <button 
                        onclick={() => selectedStudent = student}
                        class="w-full text-left p-4 rounded-2xl border transition-all 
                            {selectedStudent?.nim === student.nim 
                                ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/10' 
                                : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}"
                    >
                        <div class="flex items-center space-x-3 mb-3">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed={student.name}&backgroundColor=e2e8f0" alt="Student" class="w-10 h-10 rounded-full">
                            <div>
                                <p class="text-sm font-bold text-slate-800 leading-tight">{student.name}</p>
                                <p class="text-[10px] text-slate-500 font-mono mt-0.5">{student.nim}</p>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border {getStatusClass(student.status)}">
                                {student.status}
                            </span>
                            <span class="text-xs font-bold text-slate-700">{student.totalSks} SKS</span>
                        </div>
                    </button>
                {/each}
            </div>

            <!-- Detail View -->
            <div class="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                {#if !selectedStudent}
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <Info class="w-12 h-12 mb-3 text-slate-200" />
                        <p class="font-medium">Pilih mahasiswa di sebelah kiri untuk review</p>
                    </div>
                {:else}
                    <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="p-3 bg-white rounded-xl shadow-sm">
                                <FileText class="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-800">Detail Pengajuan: {selectedStudent.name}</h3>
                                <p class="text-xs text-slate-500 font-medium">IPK: {selectedStudent.ipk.toFixed(2)} • Semester 5</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title="Buka Profil Lengkap">
                                <ExternalLink class="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6">
                        <div class="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start space-x-3">
                            <AlertCircle class="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                            <div class="text-xs text-indigo-700 leading-relaxed">
                                <p class="font-bold mb-1">Analisis Sistem:</p>
                                <ul class="list-disc list-inside space-y-1">
                                    <li>Total beban SKS ({selectedStudent.totalSks} SKS) tidak melebihi batas maksimal ({selectedStudent.ipk >= 3 ? 24 : 21} SKS).</li>
                                    <li>Seluruh mata kuliah prasyarat telah terpenuhi oleh mahasiswa.</li>
                                    <li>Tidak terdeteksi adanya bentrok jadwal pada pilihan di bawah ini.</li>
                                </ul>
                            </div>
                        </div>

                        <table class="w-full text-left">
                            <thead class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th class="pb-3">Kode</th>
                                    <th class="pb-3">Mata Kuliah</th>
                                    <th class="pb-3 text-center">SKS</th>
                                    <th class="pb-3">Jadwal</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                {#each selectedStudent?.courses || [] as mk}
                                    <tr class="group">
                                        <td class="py-4 text-xs font-mono text-slate-500">{mk.kode}</td>
                                        <td class="py-4 text-sm font-bold text-slate-800">{mk.nama}</td>
                                        <td class="py-4 text-sm text-center font-bold text-slate-600">{mk.sks}</td>
                                        <td class="py-4 text-xs text-slate-500">{mk.jadwal}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- Actions Footer -->
                    <div class="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            {#if selectedStudent?.status === 'DISETUJUI'}
                                <span class="inline-flex items-center text-emerald-600 font-bold text-sm">
                                    <CheckCircle2 class="w-5 h-5 mr-2" />
                                    KRS Telah Disetujui
                                </span>
                            {:else if selectedStudent?.status === 'DITOLAK'}
                                <div class="flex flex-col">
                                    <span class="inline-flex items-center text-rose-600 font-bold text-sm">
                                        <XCircle class="w-5 h-5 mr-2" />
                                        KRS Telah Ditolak
                                    </span>
                                    <p class="text-[10px] text-slate-500 mt-1 italic italic">Alasan: {selectedStudent?.rejectionReason}</p>
                                </div>
                            {:else if selectedStudent?.status === 'REVISI'}
                                <div class="flex flex-col">
                                    <span class="inline-flex items-center text-blue-600 font-bold text-sm">
                                        <RotateCcw class="w-5 h-5 mr-2" />
                                        KRS Dikembalikan (Revisi)
                                    </span>
                                    <p class="text-[10px] text-slate-500 mt-1 italic italic">Catatan: {selectedStudent?.rejectionReason}</p>
                                </div>
                            {/if}
                        </div>

                        <div class="flex items-center space-x-3">
                            {#if selectedStudent?.status === 'DIAJUKAN'}
                                <button 
                                    onclick={() => showReturnModal = true}
                                    class="px-5 py-2.5 rounded-xl border-2 border-blue-100 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-all active:scale-[0.98]"
                                >
                                    Kembalikan
                                </button>
                                <button 
                                    onclick={() => showRejectModal = true}
                                    class="px-5 py-2.5 rounded-xl border-2 border-rose-100 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all active:scale-[0.98]"
                                >
                                    Tolak
                                </button>
                                <form method="POST" action="?/approve" use:enhance={() => {
                                    return async ({ update, result }) => {
                                        await update();
                                        if (result.type === 'success') {
                                            selectedStudent = data.submittedStudents.find(s => s.nim === selectedStudent?.nim) || null;
                                        }
                                    };
                                }}>
                                    <input type="hidden" name="nim" value={selectedStudent?.nim} />
                                    <button 
                                        type="submit"
                                        class="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                                    >
                                        Setujui KRS
                                    </button>
                                </form>
                            {:else}
                                <button class="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed">
                                    Sudah Diproses
                                </button>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<!-- MODAL TOLAK KRS -->
{#if showRejectModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" transition:scale>
            <div class="flex items-center space-x-3 text-rose-600 mb-4">
                <XCircle class="w-6 h-6" />
                <h3 class="text-xl font-bold">Tolak Pengajuan KRS</h3>
            </div>
            <p class="text-sm text-slate-500 mb-6">Mahasiswa akan ditolak akses KRS-nya secara permanen untuk semester ini.</p>
            
            <form method="POST" action="?/reject" use:enhance={() => {
                return async ({ update }) => {
                    showRejectModal = false;
                    await update();
                };
            }} class="space-y-4">
                <input type="hidden" name="nim" value={selectedStudent?.nim} />
                <textarea 
                    name="reason" 
                    bind:value={rejectionReason}
                    required
                    placeholder="Berikan alasan penolakan..."
                    class="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                ></textarea>
                
                <div class="flex space-x-3">
                    <button type="button" onclick={() => showRejectModal = false} class="flex-1 py-3 text-slate-500 font-bold">Batal</button>
                    <button type="submit" class="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20">Konfirmasi Tolak</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- MODAL KEMBALIKAN KRS (REVISI) -->
{#if showReturnModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" transition:scale>
            <div class="flex items-center space-x-3 text-blue-600 mb-4">
                <RotateCcw class="w-6 h-6" />
                <h3 class="text-xl font-bold">Kembalikan untuk Revisi</h3>
            </div>
            <p class="text-sm text-slate-500 mb-6">Berikan instruksi apa yang harus diperbaiki oleh mahasiswa pada draf KRS mereka.</p>
            
            <form method="POST" action="?/returnForRevision" use:enhance={() => {
                return async ({ update }) => {
                    showReturnModal = false;
                    await update();
                };
            }} class="space-y-4">
                <input type="hidden" name="nim" value={selectedStudent?.nim} />
                <textarea 
                    name="note" 
                    bind:value={returnNote}
                    required
                    placeholder="Contoh: Mata kuliah Dasar Algoritma bentrok, tolong ganti ke kelas lain."
                    class="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
                
                <div class="flex space-x-3">
                    <button type="button" onclick={() => showReturnModal = false} class="flex-1 py-3 text-slate-500 font-bold">Batal</button>
                    <button type="submit" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20">Kembalikan KRS</button>
                </div>
            </form>
        </div>
    </div>
{/if}
