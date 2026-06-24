<script lang="ts">
    import { GraduationCap, User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { form } = $props();
    let loading = $state(false);
</script>

<svelte:head>
    <title>Login | SIAT</title>
</svelte:head>

<div class="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
    
    <div class="w-full max-w-md p-8 relative z-10" in:scale={{ duration: 400, start: 0.9 }}>
        <!-- Logo Area -->
        <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 mb-4 rotate-3">
                <GraduationCap class="w-10 h-10 text-white" />
            </div>
            <h1 class="text-3xl font-black text-white tracking-tight">SIAT <span class="text-blue-500">SYSTEM</span></h1>
            <p class="text-slate-400 mt-2 font-medium">Sistem Informasi Akademik Terpadu</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            {#if form?.error}
                <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-200 text-sm" transition:slide>
                    <AlertCircle class="w-5 h-5 shrink-0" />
                    <p>{form.error}</p>
                </div>
            {/if}

            <form method="POST" action="?/login" use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    loading = false;
                    await update();
                };
            }} class="space-y-6">
                <div class="space-y-2">
                    <label for="username" class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username / NIM / NIDN</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User class="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            name="username" 
                            id="username" 
                            required 
                            placeholder="Masukkan ID Anda"
                            class="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 transition-all"
                        >
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="password" class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock class="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            required 
                            placeholder="••••••••"
                            class="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 transition-all"
                        >
                    </div>
                </div>

                <div class="pt-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if loading}
                            <Loader2 class="w-5 h-5 animate-spin" />
                            <span>Memproses...</span>
                        {:else}
                            <span>Masuk ke Sistem</span>
                            <ArrowRight class="w-5 h-5" />
                        {/if}
                    </button>
                </div>
            </form>

            <div class="mt-8 text-center">
                <p class="text-xs text-slate-500">
                    Lupa password? Silakan hubungi <span class="text-blue-400 cursor-pointer hover:underline">Pusat Informasi IT</span>
                </p>
            </div>
        </div>

        <!-- Role Helper (For development) -->
        <div class="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-slate-500 leading-relaxed">
            <p class="font-bold mb-1 uppercase tracking-wider text-slate-400">Akun Simulasi:</p>
            <p>• Mahasiswa: <code class="text-blue-400">210101001</code> / <code class="text-blue-400">password123</code></p>
            <p>• Dosen: <code class="text-indigo-400">19850101</code> / <code class="text-indigo-400">password123</code></p>
        </div>
    </div>
</div>
