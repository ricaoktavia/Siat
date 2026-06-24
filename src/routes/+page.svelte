<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { 
		GraduationCap, 
		TrendingUp, 
		BookOpen, 
		Clock, 
		Calendar, 
		BellRing, 
		ChevronRight,
		FileCheck2,
		MapPin,
		Sparkles
	} from 'lucide-svelte';

	// Dummy Data
	let student = {
		name: 'Budi Santoso',
		nim: '210101001',
		prodi: 'Teknik Informatika',
		semester: 5,
		status: 'Aktif'
	};

	let stats = {
		ipk: 3.75,
		sksTempuh: 84,
		sksSisa: 60,
		targetLulus: 'Juli 2028'
	};

	let todayClasses = [
		{ id: 1, nama: 'Desain dan Analisis Algoritma', waktu: '08:00 - 10:30', ruang: 'Gedung A - R.201', dosen: 'Dr. Ir. Riza', status: 'Selesai' },
		{ id: 2, nama: 'Kecerdasan Buatan', waktu: '13:00 - 15:30', ruang: 'Lab Komputer 3', dosen: 'Dr. Ayu Lestari', status: 'Berlangsung' },
		{ id: 3, nama: 'Pendidikan Pancasila', waktu: '16:00 - 17:40', ruang: 'Gedung B - R.105', dosen: 'Drs. Supriyanto', status: 'Menunggu' }
	];

	let announcements = [
		{ id: 1, title: 'Batas Akhir Pembayaran UKT Semester Ganjil', date: '10 Ags 2026', type: 'Penting' },
		{ id: 2, title: 'Pendaftaran Beasiswa Prestasi Telah Dibuka', date: '05 Ags 2026', type: 'Info' },
		{ id: 3, title: 'Jadwal Pengisian KRS Dimulai', date: '01 Ags 2026', type: 'Akademik' }
	];

	let krsStatus = {
		status: 'Menunggu Persetujuan',
		lastUpdate: 'Hari ini, 09:45 WIB',
		totalSks: 21,
		totalMk: 7
	};
</script>

<svelte:head>
	<title>Dashboard | SIAT</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 scroll-smooth">
	
	<!-- Hero Section -->
	<div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 overflow-hidden shadow-lg border border-blue-500/20 shrink-0">
		<!-- Decorative Elements -->
		<div class="absolute -right-10 -top-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
		<div class="absolute right-32 -bottom-20 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
		
		<div class="relative flex flex-col md:flex-row md:items-center justify-between z-10">
			<div class="mb-4 md:mb-0">
				<div class="flex items-center space-x-2 text-blue-100 mb-2 font-medium">
					<Sparkles class="w-4 h-4 text-amber-300" />
					<span class="text-sm tracking-wide uppercase">Semester Ganjil 2026/2027</span>
				</div>
				<h1 class="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">Selamat Datang, {student.name}!</h1>
				<p class="text-blue-100/90 text-sm mt-2 flex items-center">
					<GraduationCap class="w-4 h-4 mr-2" />
					{student.prodi} • Semester {student.semester}
				</p>
			</div>
			
			<div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-white min-w-[200px] flex items-center space-x-4 shadow-inner">
				<div class="p-3 bg-white/20 rounded-lg">
					<TrendingUp class="w-6 h-6 text-white" />
				</div>
				<div>
					<p class="text-xs text-blue-100 uppercase tracking-wider font-semibold">IPK Saat Ini</p>
					<div class="flex items-baseline space-x-1">
						<span class="text-2xl font-bold">{stats.ipk.toFixed(2)}</span>
						<span class="text-sm text-blue-200">/ 4.00</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
		<div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center group transition-shadow hover:shadow-md">
			<div class="p-4 rounded-xl bg-blue-50 text-blue-600 mr-4 group-hover:scale-110 transition-transform">
				<BookOpen class="w-6 h-6" />
			</div>
			<div>
				<p class="text-sm text-slate-500 font-medium">SKS Ditempuh</p>
				<p class="text-2xl font-bold text-slate-800">{stats.sksTempuh} <span class="text-sm font-normal text-slate-400">SKS</span></p>
			</div>
		</div>
		
		<div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center group transition-shadow hover:shadow-md">
			<div class="p-4 rounded-xl bg-amber-50 text-amber-600 mr-4 group-hover:scale-110 transition-transform">
				<Clock class="w-6 h-6" />
			</div>
			<div>
				<p class="text-sm text-slate-500 font-medium">Sisa SKS (Estimasi)</p>
				<p class="text-2xl font-bold text-slate-800">{stats.sksSisa} <span class="text-sm font-normal text-slate-400">SKS</span></p>
			</div>
		</div>

		<div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center group transition-shadow hover:shadow-md">
			<div class="p-4 rounded-xl bg-emerald-50 text-emerald-600 mr-4 group-hover:scale-110 transition-transform">
				<Calendar class="w-6 h-6" />
			</div>
			<div>
				<p class="text-sm text-slate-500 font-medium">Target Lulus</p>
				<p class="text-2xl font-bold text-slate-800">{stats.targetLulus}</p>
			</div>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		
		<!-- Left Column: Jadwal & KRS Status (2/3 width) -->
		<div class="lg:col-span-2 flex flex-col space-y-6">
			
			<!-- Jadwal Hari Ini -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
				<div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
					<h3 class="text-lg font-bold text-slate-800 flex items-center">
						<Calendar class="w-5 h-5 mr-2 text-indigo-500" />
						Jadwal Hari Ini
					</h3>
					<span class="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
						{todayClasses.length} Kelas
					</span>
				</div>
				
				<div class="p-5">
					<div class="space-y-4">
						{#each todayClasses as kelas (kelas.id)}
							<div class="flex relative pl-6 py-1 group">
								<!-- Timeline line -->
								<div class="absolute left-[11px] top-6 bottom-[-20px] w-[2px] bg-slate-100 group-last:hidden"></div>
								
								<!-- Timeline dot -->
								<div class="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full flex items-center justify-center bg-white border-2 
									{kelas.status === 'Selesai' ? 'border-emerald-500' : 
									 kelas.status === 'Berlangsung' ? 'border-blue-500 ring-4 ring-blue-100 animate-pulse' : 'border-slate-300'}"
								>
									<div class="w-2 h-2 rounded-full {kelas.status === 'Selesai' ? 'bg-emerald-500' : kelas.status === 'Berlangsung' ? 'bg-blue-500' : 'bg-slate-300'}"></div>
								</div>
								
								<!-- Card -->
								<div class="ml-4 flex-1 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
									<div class="flex justify-between items-start mb-2">
										<h4 class="font-bold text-slate-800 text-sm">{kelas.nama}</h4>
										<span class="text-xs font-semibold px-2 py-0.5 rounded
											{kelas.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 
											 kelas.status === 'Berlangsung' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}">
											{kelas.status}
										</span>
									</div>
									<div class="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-3">
										<div class="flex items-center">
											<Clock class="w-3.5 h-3.5 mr-1.5 text-slate-400" />
											{kelas.waktu}
										</div>
										<div class="flex items-center">
											<MapPin class="w-3.5 h-3.5 mr-1.5 text-slate-400" />
											{kelas.ruang}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Status KRS -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
				<div class="p-5 flex flex-col md:flex-row items-center justify-between">
					<div class="flex items-center mb-4 md:mb-0">
						<div class="p-3 bg-blue-50 rounded-full mr-4 border border-blue-100">
							<FileCheck2 class="w-8 h-8 text-blue-600" />
						</div>
						<div>
							<h4 class="text-sm font-bold text-slate-800">Status KRS Ganjil 2026/2027</h4>
							<p class="text-xs text-slate-500 mt-1">Terakhir diperbarui: {krsStatus.lastUpdate}</p>
						</div>
					</div>
					
					<div class="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full md:w-auto justify-between">
						<div class="text-center px-3">
							<p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status</p>
							<p class="text-sm font-bold text-amber-600">{krsStatus.status}</p>
						</div>
						<div class="w-px h-8 bg-slate-200"></div>
						<div class="text-center px-3">
							<p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total SKS</p>
							<p class="text-sm font-bold text-slate-800">{krsStatus.totalSks}</p>
						</div>
						<a href="/krs" class="ml-2 p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer" title="Lihat Detail KRS">
							<ChevronRight class="w-5 h-5" />
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Right Column: Announcements (1/3 width) -->
		<div class="flex flex-col space-y-6">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
				<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
					<h3 class="text-lg font-bold text-slate-800 flex items-center">
						<BellRing class="w-5 h-5 mr-2 text-rose-500" />
						Pengumuman
					</h3>
					<button class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">Lihat Semua</button>
				</div>
				
				<div class="p-0 flex-1 overflow-y-auto">
					{#each announcements as item}
						<div class="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer">
							<div class="flex items-center justify-between mb-2">
								<span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded
									{item.type === 'Penting' ? 'bg-rose-100 text-rose-700' : 
									 item.type === 'Akademik' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}">
									{item.type}
								</span>
								<span class="text-xs text-slate-400 font-medium">{item.date}</span>
							</div>
							<p class="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-relaxed">
								{item.title}
							</p>
						</div>
					{/each}
					
					<!-- Empty State illustration if no announcements -->
					{#if announcements.length === 0}
						<div class="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
							<BellRing class="w-10 h-10 mb-3 text-slate-200" />
							<p class="text-sm font-medium">Belum ada pengumuman terbaru.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

	</div>
</div>
