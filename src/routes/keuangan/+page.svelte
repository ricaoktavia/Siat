<script lang="ts">
    import { 
        Wallet, 
        CreditCard, 
        History, 
        CheckCircle2, 
        AlertCircle, 
        Download,
        ExternalLink,
        Copy,
        ArrowRight,
        Building,
        Receipt,
        Smartphone,
        RefreshCcw
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data, form } = $props();
    let paymentMethod = $state('transfer'); // 'transfer' or 'teller'

    function copyVA() {
        navigator.clipboard.writeText(data.billing.virtualAccount);
        alert('Virtual Account berhasil disalin!');
    }
</script>

<svelte:head>
    <title>Keuangan & UKT | SIAT</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 bg-slate-50">
    <div class="flex items-center justify-between shrink-0">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <Wallet class="w-7 h-7 mr-3 text-indigo-600" />
                Keuangan & Tagihan UKT
            </h1>
            <p class="text-sm text-slate-500 mt-1">Pantau status pembayaran dan riwayat transaksi keuangan Anda.</p>
        </div>
        
        {#if data.status === 'LUNAS'}
            <div class="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center text-emerald-700 text-sm font-bold shadow-sm" in:scale>
                <CheckCircle2 class="w-4 h-4 mr-2" />
                Semua Tagihan Lunas
            </div>
        {/if}
    </div>

    {#if form?.success}
        <div class="p-4 bg-emerald-500 text-white rounded-2xl flex items-center shadow-lg shadow-emerald-500/20" transition:slide>
            <CheckCircle2 class="w-6 h-6 mr-3" />
            <p class="font-bold">{form.message}</p>
        </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Billing Details -->
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group">
                <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                
                <div class="p-8">
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">Tagihan Semester Ini</h3>
                            <p class="text-sm text-slate-400 mt-1">{data.billing.semester}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                            {data.status === 'LUNAS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                            {data.status === 'LUNAS' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Jumlah Tagihan</p>
                            <p class="text-3xl font-black text-slate-800">Rp {data.billing.jumlah.toLocaleString('id-ID')}</p>
                        </div>
                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Batas Pembayaran</p>
                            <p class="text-xl font-bold text-rose-600">{data.billing.deadline}</p>
                        </div>
                    </div>

                    {#if data.status === 'BELUM_BAYAR'}
                        <!-- Payment Method Toggle -->
                        <div class="bg-slate-100 p-1 rounded-2xl flex mb-8">
                            <button 
                                onclick={() => paymentMethod = 'transfer'}
                                class="flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all
                                    {paymentMethod === 'transfer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
                            >
                                <Smartphone class="w-4 h-4 mr-2" />
                                Transfer Bank (VA)
                            </button>
                            <button 
                                onclick={() => paymentMethod = 'teller'}
                                class="flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all
                                    {paymentMethod === 'teller' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
                            >
                                <Building class="w-4 h-4 mr-2" />
                                Bayar via Teller
                            </button>
                        </div>

                        {#if paymentMethod === 'transfer'}
                            <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mb-8" in:fade>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Virtual Account (Bank BNI)</p>
                                        <p class="text-2xl font-black text-indigo-700 tracking-wider mt-1">{data.billing.virtualAccount}</p>
                                    </div>
                                    <button onclick={copyVA} class="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all">
                                        <Copy class="w-5 h-5" />
                                    </button>
                                </div>
                                <div class="mt-4 p-4 bg-white/50 rounded-xl">
                                    <p class="text-xs text-indigo-600 leading-relaxed font-medium">
                                        Gunakan Mobile Banking atau ATM BNI, pilih menu Pembayaran > Virtual Account Billing, dan masukkan nomor di atas.
                                    </p>
                                </div>
                            </div>
                        {:else}
                            <div class="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8" in:fade>
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center text-amber-700 font-bold">
                                        <Receipt class="w-5 h-5 mr-2" />
                                        Slip Pembayaran Teller
                                    </div>
                                    <button onclick={() => alert('Sedang mengunduh slip pembayaran PDF...')} class="text-xs font-bold text-amber-700 underline flex items-center">
                                        <Download class="w-3 h-3 mr-1" />
                                        Download Slip
                                    </button>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between text-sm py-1 border-b border-amber-200/50">
                                        <span class="text-amber-600">Nama Mahasiswa</span>
                                        <span class="font-bold text-amber-900">{data.user?.name}</span>
                                    </div>
                                    <div class="flex justify-between text-sm py-1 border-b border-amber-200/50">
                                        <span class="text-amber-600">Bank Tujuan</span>
                                        <span class="font-bold text-amber-900">BNI / Bank Mandiri</span>
                                    </div>
                                    <div class="flex justify-between text-sm py-1">
                                        <span class="text-amber-600">Kode Pembayaran</span>
                                        <span class="font-mono font-bold text-amber-900 text-lg">99{data.billing.virtualAccount.slice(2)}</span>
                                    </div>
                                </div>
                                <p class="mt-4 text-[11px] text-amber-700 leading-relaxed italic">
                                    Sampaikan ke petugas teller Bank bahwa Anda ingin melakukan pembayaran UKT Universitas Nusantara dengan kode pembayaran di atas.
                                </p>
                            </div>
                        {/if}

                        <form method="POST" action="?/pay" use:enhance>
                            <button type="submit" class="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center group">
                                <CreditCard class="w-5 h-5 mr-2" />
                                Konfirmasi Pembayaran Berhasil
                                <ArrowRight class="w-5 h-5 ml-2 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                            </button>
                        </form>
                    {:else}
                        <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center" in:fade>
                            <p class="text-emerald-700 font-bold">Terima kasih! Pembayaran UKT Anda telah divalidasi oleh sistem.</p>
                            <button class="mt-4 px-6 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all flex items-center justify-center mx-auto">
                                <Download class="w-4 h-4 mr-2" />
                                Unduh Bukti Bayar
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Payment Methods Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                        <AlertCircle class="w-5 h-5" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-800">Informasi Penting</h4>
                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">Pastikan nominal transfer sesuai hingga 3 digit terakhir jika menggunakan metode manual.</p>
                    </div>
                </div>
                <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                        <ExternalLink class="w-5 h-5" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-800">Bantuan Keuangan</h4>
                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">Mengalami kesulitan pembayaran? Ajukan keringanan UKT melalui biro kemahasiswaan.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- History Sidebar -->
        <div class="space-y-6">
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <History class="w-5 h-5 text-slate-400 mr-2" />
                    <h3 class="text-md font-bold text-slate-800">Riwayat Pembayaran</h3>
                </div>
                <div class="p-0 overflow-y-auto max-h-[500px]">
                    <div class="divide-y divide-slate-50">
                        <div class="p-5 hover:bg-slate-50 transition-colors">
                            <div class="flex justify-between items-start mb-1">
                                <p class="text-sm font-bold text-slate-800">UKT Semester Genap 2025/2026</p>
                                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                            </div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rp 5.000.000 • 15 Jan 2026</p>
                        </div>
                        <div class="p-5 hover:bg-slate-50 transition-colors">
                            <div class="flex justify-between items-start mb-1">
                                <p class="text-sm font-bold text-slate-800">UKT Semester Ganjil 2025/2026</p>
                                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                            </div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rp 5.000.000 • 12 Ags 2025</p>
                        </div>
                        <div class="p-5 hover:bg-slate-50 transition-colors">
                            <div class="flex justify-between items-start mb-1">
                                <p class="text-sm font-bold text-slate-800">UKT Semester Genap 2024/2025</p>
                                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                            </div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rp 5.000.000 • 10 Jan 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Simulation Reset Button -->
<div class="fixed bottom-6 left-6 z-40">
    <form method="POST" action="?/resetStatus" use:enhance>
        <button 
            type="submit"
            class="p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all group flex items-center overflow-hidden"
            title="Reset Status ke Belum Bayar (Simulasi)"
        >
            <RefreshCcw class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span class="max-w-0 group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap text-xs font-bold">Reset Status</span>
        </button>
    </form>
</div>

