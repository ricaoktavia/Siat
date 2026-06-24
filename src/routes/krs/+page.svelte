<script lang="ts">
	import { 
		Search, 
		Filter, 
		Plus, 
		Trash2, 
		AlertCircle,
		CheckCircle2,
		Info,
		BookMarked,
		Clock,
		X,
		Wallet
	} from 'lucide-svelte';
	import { fade, slide, scale } from 'svelte/transition';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	// Derived from Server Load Data
	let catalog = $derived(data.catalog);
	let draft = $derived(data.draft);
	let maxSks = $derived(data.maxSks);
	let currentIpk = $derived(data.student.ipk);
	let totalSks = $derived(data.totalSks);
	let krsStatus = $derived(data.krsStatus);

	let progressPercentage = $derived((totalSks / maxSks) * 100);

	let searchQuery = $state('');
	let selectedSemester = $state('5');
	let selectedProdi = $state('Teknik Informatika');

	let filteredCatalog = $derived(
		catalog.filter(mk => 
			mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
			mk.kode.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	let agreeCheckbox = $state(false);
	let isModalOpen = $state(false);
	let isAddCourseModalOpen = $state(false);

	// To clear form notifications automatically
	let toastVisible = $state(false);
	$effect(() => {
		if (form?.error || form?.success) {
			toastVisible = true;
			const timer = setTimeout(() => {
				toastVisible = false;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});

	// Helper for badge color
	function getBadgeClass(sisa: number) {
		if (sisa === 0) return 'bg-red-100 text-red-700 border-red-200';
		if (sisa < 5) return 'bg-amber-100 text-amber-700 border-amber-200';
		return 'bg-emerald-100 text-emerald-700 border-emerald-200';
	}
</script>

<svelte:head>
	<title>Pengisian KRS | SIAT</title>
</svelte:head>

<!-- Global Notification Toast -->
{#if toastVisible && form}
	<div 
		class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 rounded-xl shadow-2xl border min-w-[300px] {form.error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}"
		transition:scale={{ duration: 300, start: 0.9 }}
	>
		{#if form.error}
			<AlertCircle class="w-5 h-5 mr-3 shrink-0" />
		{:else}
			<CheckCircle2 class="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
		{/if}
		<p class="text-sm font-medium flex-1">{form.error || form.message}</p>
		<button onclick={() => toastVisible = false} class="ml-4 opacity-70 hover:opacity-100">
			<X class="w-4 h-4" />
		</button>
	</div>
{/if}

<div class="h-full flex w-full relative">
	{#if data.uktStatus === 'BELUM_BAYAR'}
		<div class="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
			<div class="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center" transition:scale>
				<div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
					<Wallet class="w-10 h-10" />
				</div>
				<h3 class="text-2xl font-black text-slate-800">Akses Terkunci!</h3>
				<p class="text-slate-500 mt-4 leading-relaxed">
					Maaf, Anda belum dapat melakukan <strong>Pengisian KRS</strong> karena status pembayaran UKT semester ini belum lunas.
				</p>
				<div class="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-left">
					<div>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tagihan Anda</p>
						<p class="text-lg font-black text-slate-800">Rp 5.000.000</p>
					</div>
					<a 
						href="/keuangan" 
						class="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
					>
						Bayar Sekarang
					</a>
				</div>
				<p class="text-[10px] text-slate-400 mt-6">Jika Anda sudah membayar, mohon tunggu proses verifikasi maksimal 1x24 jam.</p>
			</div>
		</div>
	{/if}
	
	<!-- PANEL KIRI (60%): Katalog Mata Kuliah -->
	<section class="w-[60%] flex flex-col h-full border-r border-slate-200 bg-white shadow-sm z-0 relative">
		
		<!-- Header & Filters -->
		<div class="p-6 pb-4 border-b border-slate-100 bg-white shrink-0">
			<div class="flex justify-between items-end mb-5">
				<div>
					<h2 class="text-xl font-bold text-slate-800 flex items-center">
						<BookMarked class="w-6 h-6 mr-2 text-blue-600" />
						Katalog Mata Kuliah
					</h2>
					<p class="text-sm text-slate-500 mt-1">Pilih mata kuliah yang ditawarkan pada periode ini.</p>
				</div>
				<!-- KRS Status Indicator & Admin Action -->
				<div class="flex items-center space-x-3">
					<button 
						onclick={() => isAddCourseModalOpen = true}
						class="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
					>
						<Plus class="w-4 h-4 mr-1.5" />
						Tambah MK Baru
					</button>

					{#if krsStatus === 'DIAJUKAN'}
						<span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-sm font-bold shadow-sm border border-blue-200">
							<Clock class="w-4 h-4 mr-2" />
							Menunggu Approval Dosen
						</span>
					{:else if krsStatus === 'DRAFT'}
						<span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
							Mode Draft
						</span>
					{/if}
				</div>
			</div>

			<div class="flex flex-wrap gap-3 items-center">
				<!-- Search -->
				<div class="relative flex-1 min-w-[200px]">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search class="h-4 w-4 text-slate-400" />
					</div>
					<input 
						type="text" 
						bind:value={searchQuery}
						class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" 
						placeholder="Cari kode atau nama MK..."
					>
				</div>
				
				<!-- Filters -->
				<div class="flex items-center space-x-2">
					<div class="relative">
						<select bind:value={selectedSemester} class="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm">
							<option value="1">Semester 1</option>
							<option value="3">Semester 3</option>
							<option value="5">Semester 5</option>
							<option value="7">Semester 7</option>
						</select>
						<Filter class="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
					</div>

					<div class="relative hidden sm:block">
						<select bind:value={selectedProdi} class="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm">
							<option>Teknik Informatika</option>
							<option>Sistem Informasi</option>
						</select>
						<Filter class="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none hidden sm:block" />
					</div>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="flex-1 overflow-auto bg-slate-50/50 relative">
			{#if krsStatus !== 'DRAFT'}
				<div class="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
					<div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center max-w-sm">
						<BookMarked class="w-12 h-12 text-slate-300 mx-auto mb-3" />
						<h3 class="font-bold text-lg text-slate-800">KRS Telah Diajukan</h3>
						<p class="text-sm text-slate-500 mt-2">Anda tidak dapat menambah mata kuliah lagi karena KRS sedang direview oleh Dosen Wali.</p>
					</div>
				</div>
			{/if}

			<table class="w-full text-left text-sm whitespace-nowrap">
				<thead class="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm">
					<tr>
						<th class="px-6 py-3 border-b border-slate-200">Kode</th>
						<th class="px-6 py-3 border-b border-slate-200 w-full">Mata Kuliah & Dosen</th>
						<th class="px-6 py-3 border-b border-slate-200 text-center">SKS</th>
						<th class="px-6 py-3 border-b border-slate-200">Jadwal</th>
						<th class="px-6 py-3 border-b border-slate-200 text-center">Kuota</th>
						<th class="px-6 py-3 border-b border-slate-200"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 bg-white">
					{#each filteredCatalog as mk (mk.id)}
						{@const inDraft = draft.some(d => d.id === mk.id)}
						<tr class="hover:bg-slate-50 transition-colors group {inDraft ? 'bg-blue-50/30' : ''}">
							<td class="px-6 py-4 font-mono text-xs text-slate-500">{mk.kode}</td>
							<td class="px-6 py-4">
								<p class="font-semibold text-slate-800 {mk.sisa === 0 ? 'line-through opacity-70' : ''}">
									{mk.nama}
									{#if mk.prerequisites.length > 0}
										<span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-rose-100 text-rose-700" title="Memiliki Prasyarat: {mk.prerequisites.join(', ')}">
											Syarat
										</span>
									{/if}
								</p>
								<p class="text-xs text-slate-500 mt-0.5">{mk.dosen}</p>
							</td>
							<td class="px-6 py-4 text-center font-medium text-slate-700">{mk.sks}</td>
							<td class="px-6 py-4">
								<div class="flex items-center text-slate-600 text-xs">
									<Clock class="w-3.5 h-3.5 mr-1.5 text-slate-400" />
									{mk.jadwal}
								</div>
							</td>
							<td class="px-6 py-4 text-center">
								<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border {getBadgeClass(mk.sisa)}">
									{#if mk.sisa === 0}
										Penuh
									{:else if mk.sisa < 5}
										Sisa {mk.sisa}
									{:else}
										Tersedia
									{/if}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<form method="POST" action="?/addCourse" use:enhance={() => {
									// Optional: Do something before sending like showing a loading state
									return async ({ update }) => {
										await update(); // Automatically updates data and form props
									};
								}}>
									<input type="hidden" name="courseId" value={mk.id} />
									<button 
										type="submit"
										disabled={mk.sisa === 0 || inDraft || krsStatus !== 'DRAFT'}
										class="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all
											{mk.sisa === 0 || inDraft || krsStatus !== 'DRAFT'
												? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
												: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-200'}"
									>
										{#if inDraft}
											<CheckCircle2 class="w-4 h-4 mr-1.5" /> Terpilih
										{:else}
											<Plus class="w-4 h-4 mr-1.5" /> Ambil
										{/if}
									</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-slate-500">
								Tidak ada mata kuliah yang cocok dengan pencarian Anda.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- PANEL KANAN (40%): Draft KRS Mahasiswa -->
	<section class="w-[40%] flex flex-col h-full bg-slate-50/50 relative">
		
		<!-- Progress Card -->
		<div class="p-6 shrink-0 bg-white border-b border-slate-200 z-10 shadow-sm relative overflow-hidden">
			<!-- Decor -->
			<div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
			
			<div class="flex justify-between items-start mb-4">
				<div>
					<h3 class="text-lg font-bold text-slate-800">
						{krsStatus === 'DRAFT' ? 'Draft KRS Anda' : 'KRS Diajukan'}
					</h3>
					<p class="text-xs text-slate-500 mt-0.5">Tinjau mata kuliah yang dipilih.</p>
				</div>
				<div class="text-right">
					<p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">IPK Terakhir</p>
					<p class="text-2xl font-bold text-blue-600 leading-none">{currentIpk.toFixed(2)}</p>
				</div>
			</div>

			<!-- Progress Bar -->
			<div class="bg-slate-100 rounded-xl p-4 border border-slate-200 shadow-inner">
				<div class="flex justify-between text-sm font-medium mb-2">
					<span class="text-slate-700">Total Beban SKS</span>
					<span class="text-slate-900">{totalSks} <span class="text-slate-400 font-normal">/ {maxSks} SKS</span></span>
				</div>
				<div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
					<div 
						class="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out relative" 
						style="width: {Math.min(progressPercentage, 100)}%"
					>
						<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
					</div>
				</div>
				{#if totalSks > maxSks - 4 && totalSks <= maxSks}
					<p class="text-[10px] text-amber-600 mt-2 flex items-center">
						<AlertCircle class="w-3 h-3 mr-1" /> Mendekati batas maksimal SKS yang diizinkan
					</p>
				{/if}
			</div>
		</div>

		<!-- List Scrollable -->
		<div class="flex-1 overflow-auto p-6 pt-4 space-y-3">
			{#if draft.length === 0}
				<div class="flex flex-col items-center justify-center h-full text-center text-slate-400">
					<BookMarked class="w-12 h-12 mb-3 text-slate-200" />
					<p class="font-medium text-slate-500">Belum ada mata kuliah yang dipilih</p>
					<p class="text-xs mt-1">Silakan pilih mata kuliah dari katalog di sebelah kiri.</p>
				</div>
			{:else}
				{#each draft as item (item.id)}
					<div 
						in:slide={{ duration: 200 }} 
						out:fade={{ duration: 150 }}
						class="group relative flex items-center bg-white p-4 rounded-xl border transition-all shadow-sm
							{item.bentrok ? 'border-red-300 bg-rose-50/50' : 'border-slate-200'}"
					>
						<!-- Left Accent -->
						<div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl {item.bentrok ? 'bg-red-400' : 'bg-blue-400'}"></div>
						
						<div class="flex-1 pl-2">
							<div class="flex justify-between items-start">
								<h4 class="font-semibold text-slate-800 text-sm">{item.nama}</h4>
								<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 ml-2 shrink-0">
									{item.sks} SKS
								</span>
							</div>
							<div class="flex items-center text-xs mt-1.5 {item.bentrok ? 'text-red-600 font-medium' : 'text-slate-500'}">
								<Clock class="w-3.5 h-3.5 mr-1 {item.bentrok ? 'text-red-500' : 'text-slate-400'}" />
								{item.jadwal}
								{#if item.bentrok}
									<span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] uppercase font-bold tracking-wider">
										Bentrok!
									</span>
								{/if}
							</div>
						</div>

						{#if krsStatus === 'DRAFT'}
							<form method="POST" action="?/removeCourse" use:enhance>
								<input type="hidden" name="courseId" value={item.id} />
								<button 
									type="submit"
									class="ml-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
									title="Hapus"
								>
									<Trash2 class="w-5 h-5" />
								</button>
							</form>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<!-- Sticky Footer Action -->
		{#if krsStatus === 'DRAFT'}
			<div class="shrink-0 bg-white border-t border-slate-200 p-6 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
				<label class="flex items-start space-x-3 cursor-pointer group mb-4">
					<div class="relative flex items-center justify-center mt-0.5">
						<input 
							type="checkbox" 
							bind:checked={agreeCheckbox}
							class="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
						>
						<CheckCircle2 class="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth="3" />
					</div>
					<span class="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-snug">
						Saya menyatakan bahwa mata kuliah yang dipilih sudah sesuai dengan arahan Dosen Wali dan siap untuk diajukan.
					</span>
				</label>

				<button 
					onclick={() => isModalOpen = true}
					disabled={!agreeCheckbox || draft.length === 0}
					class="w-full py-3.5 px-4 rounded-xl text-white font-semibold flex items-center justify-center transition-all duration-200
						{!agreeCheckbox || draft.length === 0
							? 'bg-slate-300 cursor-not-allowed shadow-none' 
							: 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]'}"
				>
					Ajukan KRS ke Dosen Wali
				</button>
			</div>
		{/if}
	</section>
</div>

<!-- MODAL KONFIRMASI (Maker-Checker Submit) -->
{#if isModalOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
			transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}
		>
			<div class="bg-blue-600 p-6 text-center text-white relative">
				<div class="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
					<Info class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-xl font-bold">Konfirmasi Pengajuan KRS</h3>
				<p class="text-blue-100 text-sm mt-1">Pastikan data pilihan Anda sudah benar.</p>
			</div>
			
			<div class="p-6">
				<div class="space-y-4 mb-6">
					<div class="flex justify-between items-center py-3 border-b border-slate-100">
						<span class="text-slate-500 font-medium">Total Mata Kuliah</span>
						<span class="text-lg font-bold text-slate-800">{draft.length} MK</span>
					</div>
					<div class="flex justify-between items-center py-3 border-b border-slate-100">
						<span class="text-slate-500 font-medium">Total Beban SKS</span>
						<span class="text-lg font-bold text-slate-800">{totalSks} SKS</span>
					</div>
					{#if draft.some(d => d.bentrok)}
						<div class="flex items-start p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 mt-2">
							<AlertCircle class="w-5 h-5 mr-2 shrink-0 mt-0.5" />
							<p class="text-sm">Terdapat jadwal yang <strong>bentrok</strong> dalam draf Anda. Yakin ingin melanjutkan?</p>
						</div>
					{/if}
				</div>

				<div class="flex space-x-3">
					<button 
						onclick={() => isModalOpen = false}
						class="flex-1 py-2.5 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors"
					>
						Batal
					</button>
					<form method="POST" action="?/submitKRS" use:enhance={() => {
						return async ({ update }) => {
							isModalOpen = false;
							await update();
						};
					}} class="flex-1">
						<button 
							type="submit"
							class="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md hover:shadow-blue-600/30 transition-all"
						>
							Ya, Ajukan
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL TAMBAH MATA KULIAH BARU (Admin Feature) -->
{#if isAddCourseModalOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
			transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}
		>
			<div class="bg-emerald-600 p-6 text-white flex justify-between items-center">
				<div class="flex items-center space-x-3">
					<div class="p-2 bg-white/20 rounded-lg">
						<Plus class="w-6 h-6" />
					</div>
					<div>
						<h3 class="text-xl font-bold">Tambah Mata Kuliah Baru</h3>
						<p class="text-emerald-100 text-xs">Masukkan detail mata kuliah ke katalog.</p>
					</div>
				</div>
				<button onclick={() => isAddCourseModalOpen = false} class="text-white/70 hover:text-white">
					<X class="w-6 h-6" />
				</button>
			</div>
			
			<form method="POST" action="?/createCourse" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						isAddCourseModalOpen = false;
					}
					await update();
				};
			}} class="p-6 space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="kode" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Kode MK</label>
						<input type="text" id="kode" name="kode" required placeholder="Contoh: IF1234" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
					</div>
					<div class="space-y-1.5">
						<label for="sks" class="text-xs font-bold text-slate-500 uppercase tracking-wider">SKS</label>
						<input type="number" id="sks" name="sks" required min="1" max="6" value="3" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="nama" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Mata Kuliah</label>
					<input type="text" id="nama" name="nama" required placeholder="Masukkan nama mata kuliah..." class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
				</div>

				<div class="space-y-1.5">
					<label for="dosen" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosen Pengampu</label>
					<input type="text" id="dosen" name="dosen" required placeholder="Nama dosen gelar..." class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="jadwal" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jadwal</label>
						<input type="text" id="jadwal" name="jadwal" required placeholder="Hari, Jam" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
					</div>
					<div class="space-y-1.5">
						<label for="kuota" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Kuota</label>
						<input type="number" id="kuota" name="kuota" required min="1" value="40" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
					</div>
				</div>

				<div class="pt-4 flex space-x-3">
					<button 
						type="button"
						onclick={() => isAddCourseModalOpen = false}
						class="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
					>
						Batal
					</button>
					<button 
						type="submit"
						class="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
					>
						Simpan MK
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

