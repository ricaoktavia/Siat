<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { 
		LayoutDashboard, 
		User, 
		BookOpenCheck, 
		FileText, 
		CalendarDays,
		GraduationCap,
		LogOut,
		Bell,
		ChevronRight,
		Users,
		ClipboardCheck,
		BookOpen,
		Wallet,
		UserCheck
	} from 'lucide-svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data, children } = $props();

	// Menu for Students
	const studentMenu = [
		{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
		{ id: 'biodata', label: 'Biodata', icon: User, path: '/biodata' },
		{ id: 'krs', label: 'Pengisian KRS', icon: BookOpenCheck, path: '/krs' },
		{ id: 'khs', label: 'KHS & Transkrip', icon: FileText, path: '/khs' },
		{ id: 'presensi', label: 'Kehadiran', icon: UserCheck, path: '/presensi' },
		{ id: 'jadwal', label: 'Jadwal Kuliah', icon: CalendarDays, path: '/jadwal' },
		{ id: 'keuangan', label: 'Keuangan & UKT', icon: Wallet, path: '/keuangan' }
	];

	// Menu for Lecturers
	const lecturerMenu = [
		{ id: 'lecturer-dashboard', label: 'Dashboard Dosen', icon: LayoutDashboard, path: '/lecturer' },
		{ id: 'perwalian', label: 'Mahasiswa', icon: Users, path: '/lecturer/students' },
		{ id: 'krs-review', label: 'Review KRS', icon: ClipboardCheck, path: '/lecturer/krs-review' },
		{ id: 'grades', label: 'Input Nilai', icon: FileText, path: '/lecturer/grades' },
		{ id: 'teaching', label: 'Jadwal Mengajar', icon: BookOpen, path: '/lecturer/schedule' }
	];

	// Determine which menu to show
	let menuItems = $derived(data.role === 'LECTURER' ? lecturerMenu : studentMenu);
	let currentPath = $derived($page.url.pathname);

	// Breadcrumbs logic
	let breadcrumbs = $derived.by(() => {
		if (currentPath === '/login') return [];
		if (data.role === 'LECTURER') {
			if (currentPath === '/lecturer') return ['SIAT', 'Dosen', 'Dasbor'];
			if (currentPath.includes('krs-review')) return ['SIAT', 'Akademik', 'Review KRS'];
			if (currentPath.includes('grades')) return ['SIAT', 'Akademik', 'Input Nilai'];
			return ['SIAT', 'Dosen', 'Menu'];
		}
		if (currentPath === '/') return ['SIAT', 'Dashboard'];
		if (currentPath.startsWith('/krs')) return ['SIAT', 'Akademik', 'Pengisian KRS'];
		if (currentPath.startsWith('/biodata')) return ['SIAT', 'Profil', 'Biodata'];
		return ['SIAT', 'Mahasiswa', 'Menu'];
	});

	// If we are on login page, don't show the layout (sidebar/topbar)
	let isLoginPage = $derived(currentPath === '/login');
</script>

<svelte:head>
	<title>SIAT System</title>
</svelte:head>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
		<!-- Sidebar -->
		<aside class="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 shrink-0">
			<div class="h-16 flex items-center px-6 bg-slate-950/50 border-b border-slate-800">
				<GraduationCap class="w-8 h-8 text-blue-500 mr-3" />
				<div>
					<h1 class="text-white font-bold text-lg leading-tight tracking-wide">SIAT</h1>
					<p class="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Univ. Nusantara</p>
				</div>
			</div>

			<nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
				<div class="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
					{data.role === 'LECTURER' ? 'Menu Dosen' : 'Menu Utama'}
				</div>
				{#each menuItems as item}
					{@const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))}
					<a 
						href={item.path}
						class="flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
							{isActive 
								? 'bg-blue-600/10 text-blue-400 font-medium' 
								: 'hover:bg-slate-800 hover:text-white'}"
					>
						<svelte:component 
							this={item.icon} 
							class="w-5 h-5 mr-3 {isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-300 transition-colors'}" 
						/>
						{item.label}
						{#if isActive}
							<div class="ml-auto w-1.5 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
						{/if}
					</a>
				{/each}
			</nav>

			<div class="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
				&copy; 2026 SIAT System
			</div>
		</aside>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col h-screen overflow-hidden relative">
			<header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
				<div class="flex items-center text-sm text-slate-500 font-medium">
					{#each breadcrumbs as crumb, i}
						<span class="{i === breadcrumbs.length - 1 ? 'text-slate-900 font-semibold' : ''}">
							{crumb}
						</span>
						{#if i < breadcrumbs.length - 1}
							<ChevronRight class="w-4 h-4 mx-2 text-slate-400" />
						{/if}
					{/each}
				</div>

				<div class="flex items-center space-x-6">
					<button class="relative text-slate-400 hover:text-slate-600 transition-colors">
						<Bell class="w-5 h-5" />
						<span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
					</button>

					<div class="h-8 w-px bg-slate-200"></div>

					<div class="flex items-center space-x-3">
						<div class="text-right hidden sm:block">
							<p class="text-sm font-semibold text-slate-900 leading-none">{data.user?.name || 'User'}</p>
							<p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{data.role}</p>
						</div>
						<img 
							src="https://api.dicebear.com/7.x/avataaars/svg?seed={data.user?.name}&backgroundColor=e2e8f0" 
							alt="Profile" 
							class="w-9 h-9 rounded-full ring-2 ring-slate-100"
						/>
					</div>

					<form method="POST" action="/login?/logout" class="inline">
						<button type="submit" class="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50" title="Logout">
							<LogOut class="w-5 h-5" />
						</button>
					</form>
				</div>
			</header>

			<main class="flex-1 overflow-hidden bg-slate-50">
				{@render children()}
			</main>
		</div>
	</div>
	<Toast />
{/if}
