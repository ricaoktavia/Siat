<script lang="ts">
    import { 
        Users, 
        Search, 
        Filter, 
        ChevronRight, 
        GraduationCap, 
        TrendingUp,
        Mail,
        MoreVertical,
        Download
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { X, Phone, MessageSquare, ExternalLink, Calendar, BookOpen } from 'lucide-svelte';
    import { toast } from '$lib/stores/toast';

    let { data } = $props();
    let searchQuery = $state('');
    let selectedStudent = $state<any>(null);
    let showProfileModal = $state(false);
    let showContactModal = $state(false);

    let students = $derived(data.students || []);
    let filteredStudents = $derived(
        students.filter((s: any) => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.nim.includes(searchQuery)
        )
    );

    function openProfile(student: any) {
        selectedStudent = student;
        showProfileModal = true;
    }

    function openContact(student: any) {
        selectedStudent = student;
        showContactModal = true;
    }
</script>

<svelte:head>
    <title>Mahasiswa | SIAT Dosen</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-hidden bg-slate-50 space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <Users class="w-7 h-7 mr-3 text-blue-600" />
                Mahasiswa
            </h1>
            <p class="text-sm text-slate-500 mt-1">Kelola dan pantau perkembangan akademik mahasiswa bimbingan Anda.</p>
        </div>
        
        <button 
            onclick={() => toast.add('Data Mahasiswa Wali berhasil diekspor ke Excel!', 'success')}
            class="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
        >
            <Download class="w-4 h-4 mr-2" />
            Ekspor Data
        </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center shrink-0">
        <div class="relative flex-1 min-w-[250px]">
            <Search class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Cari nama atau NIM mahasiswa..."
                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
        </div>
        
        <select class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option>Semua Angkatan</option>
            <option>Angkatan 2021</option>
            <option>Angkatan 2022</option>
        </select>

        <select class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option>Status: Semua</option>
            <option>Aktif</option>
            <option>Cuti</option>
            <option>Lulus</option>
        </select>
    </div>

    <!-- Students Grid -->
    <div class="flex-1 overflow-y-auto pr-2">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {#each filteredStudents as student (student.nim)}
                <div 
                    in:fade
                    class="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col relative overflow-hidden"
                >
                    <!-- Top Gradient Decoration -->
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div class="relative">
                                <img 
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed={student.name}&backgroundColor=e2e8f0" 
                                    alt="Student" 
                                    class="w-16 h-16 rounded-2xl ring-4 ring-slate-50"
                                >
                                <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Status: Aktif"></div>
                            </div>
                            <button class="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <MoreVertical class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="mb-5">
                            <h3 class="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{student.name}</h3>
                            <p class="text-xs text-slate-500 font-medium">{student.nim} • {student.prodi}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</p>
                                <div class="flex items-center text-sm font-bold text-slate-700 mt-0.5">
                                    <GraduationCap class="w-4 h-4 mr-2 text-blue-500" />
                                    {student.semester}
                                </div>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IPK Saat Ini</p>
                                <div class="flex items-center text-sm font-bold text-slate-700 mt-0.5">
                                    <TrendingUp class="w-4 h-4 mr-2 text-emerald-500" />
                                    {student.ipk.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div class="flex space-x-2">
                            <button 
                                onclick={() => openContact(student)}
                                class="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
                            >
                                <Mail class="w-4 h-4 mr-2" />
                                Kontak
                            </button>
                            <button 
                                onclick={() => openProfile(student)}
                                class="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center"
                            >
                                Profil
                                <ChevronRight class="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="col-span-full py-20 text-center">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                        <Users class="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 class="text-lg font-bold text-slate-400">Mahasiswa tidak ditemukan</h3>
                    <p class="text-sm text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- MODAL PROFIL MAHASISWA -->
{#if showProfileModal && selectedStudent}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" transition:scale>
            <div class="bg-blue-600 p-8 text-white relative">
                <button onclick={() => showProfileModal = false} class="absolute top-6 right-6 text-white/70 hover:text-white">
                    <X class="w-6 h-6" />
                </button>
                <div class="flex items-center space-x-6">
                    <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed={selectedStudent.name}&backgroundColor=e2e8f0" 
                        alt="Student" 
                        class="w-20 h-20 rounded-2xl border-4 border-white/20"
                    >
                    <div>
                        <h3 class="text-2xl font-bold">{selectedStudent.name}</h3>
                        <p class="text-blue-100 font-medium">{selectedStudent.nim} • {selectedStudent.prodi}</p>
                    </div>
                </div>
            </div>
            
            <div class="p-8 space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</p>
                        <p class="text-xl font-bold text-slate-800">{selectedStudent.semester}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IPK Kumulatif</p>
                        <p class="text-xl font-bold text-emerald-600">{selectedStudent.ipk.toFixed(2)}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKS Tempuh</p>
                        <p class="text-xl font-bold text-blue-600">84 SKS</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="font-bold text-slate-800 flex items-center">
                        <Calendar class="w-5 h-5 mr-2 text-slate-400" />
                        Aktivitas Terakhir
                    </h4>
                    <div class="bg-slate-50 rounded-2xl p-6 space-y-4">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-slate-500 flex items-center">
                                <BookOpen class="w-4 h-4 mr-2" />
                                Pengisian KRS
                            </span>
                            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">DISETUJUI</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-slate-500 flex items-center">
                                <TrendingUp class="w-4 h-4 mr-2" />
                                Update Nilai (Semester 4)
                            </span>
                            <span class="text-slate-700 font-bold">IPS: 3.82</span>
                        </div>
                    </div>
                </div>

                <button onclick={() => showProfileModal = false} class="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center">
                    Tutup Detail Profil
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- MODAL KONTAK MAHASISWA -->
{#if showContactModal && selectedStudent}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" transition:scale>
            <div class="p-8 text-center">
                <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail class="w-10 h-10" />
                </div>
                <h3 class="text-xl font-bold text-slate-800">Hubungi Mahasiswa</h3>
                <p class="text-sm text-slate-500 mt-2">Silakan pilih metode komunikasi untuk menghubungi {selectedStudent.name}.</p>
            </div>
            
            <div class="px-8 pb-8 space-y-3">
                <a 
                    href="mailto:{selectedStudent.nim}@mhs.nusantara.ac.id" 
                    class="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                    <div class="flex items-center">
                        <div class="p-2 bg-white rounded-xl shadow-sm mr-4 text-blue-500">
                            <Mail class="w-5 h-5" />
                        </div>
                        <div class="text-left">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Email Institusi</p>
                            <p class="text-sm font-bold text-slate-700 mt-1">{selectedStudent.nim}@mhs.nusantara.ac.id</p>
                        </div>
                    </div>
                    <ExternalLink class="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </a>

                <button 
                    onclick={() => toast.add('Membuka WhatsApp Web...', 'info')}
                    class="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                >
                    <div class="flex items-center">
                        <div class="p-2 bg-white rounded-xl shadow-sm mr-4 text-emerald-500">
                            <MessageSquare class="w-5 h-5" />
                        </div>
                        <div class="text-left">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">WhatsApp</p>
                            <p class="text-sm font-bold text-slate-700 mt-1">+62 812-xxxx-xxxx</p>
                        </div>
                    </div>
                    <Phone class="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                </button>

                <button onclick={() => showContactModal = false} class="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                    Batal
                </button>
            </div>
        </div>
    </div>
{/if}

