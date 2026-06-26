<script lang="ts">
	import { 
		User, 
		MapPin, 
		Phone, 
		Mail, 
		ShieldCheck, 
		GraduationCap, 
		BookOpen, 
		Edit3, 
		Download,
		Users,
		X
	} from 'lucide-svelte';
	import { fade, slide, scale } from 'svelte/transition';
	import { toast } from '$lib/stores/toast';
	import jsPDF from 'jspdf';
	import { enhance } from '$app/forms';

	let { data } = $props();

	// Dummy Data merged with actual data
	let student = $state({
		name: data?.user?.name || 'Mahasiswa',
		nim: data?.studentInfo?.nim || '-',
		prodi: data?.studentInfo?.prodi || 'Teknik Informatika',
		fakultas: 'Ilmu Komputer',
		status: 'Aktif',
		jalurMasuk: 'SNMPTN',
		tahunMasuk: 2023,
		dosenWali: 'Sholeh Rachmatullah'
	});

	let personalInfo = $state({
		nik: data?.studentInfo?.nik || '3578012345678901',
		tempatLahir: data?.studentInfo?.tempatLahir || 'Surabaya',
		tanggalLahir: data?.studentInfo?.tanggalLahir || '15 Agustus 2003',
		jenisKelamin: data?.studentInfo?.jenisKelamin || 'Laki-laki',
		agama: data?.studentInfo?.agama || 'Islam',
		kewarganegaraan: data?.studentInfo?.kewarganegaraan || 'WNI',
		golonganDarah: data?.studentInfo?.golonganDarah || 'O'
	});

	let contactInfo = $state({
		email: data?.studentInfo?.email || 'budi.santoso@mhs.nusantara.ac.id',
		emailPribadi: data?.studentInfo?.emailPribadi || 'budi.snt@gmail.com',
		noHp: data?.studentInfo?.noHp || '+62 812-3456-7890',
		alamatAsal: data?.studentInfo?.alamatAsal || 'Jl. Merdeka No. 45, RT 01/RW 02, Kec. Sukolilo, Surabaya, Jawa Timur 60111',
		alamatDomisili: data?.studentInfo?.alamatDomisili || 'Jl. Raya Kampus No. 12 (Kos Bu Marni), Bandung, Jawa Barat'
	});

	let parentInfo = $state({
		namaAyah: data?.studentInfo?.namaAyah || 'Sudirman',
		pekerjaanAyah: data?.studentInfo?.pekerjaanAyah || 'Wiraswasta',
		namaIbu: data?.studentInfo?.namaIbu || 'Siti Rahmawati',
		pekerjaanIbu: data?.studentInfo?.pekerjaanIbu || 'PNS',
		noTeleponDarurat: data?.studentInfo?.noTeleponDarurat || '+62 813-9876-5432'
	});


	let showEditProfile = $state(false);
	let showEditPhoto = $state(false);
	let isDownloading = $state(false);
	let profileImageUrl = $state(`https://ui-avatars.com/api/?name=${encodeURIComponent(data?.user?.name || 'Mahasiswa')}&background=e2e8f0&color=334155&size=128&rounded=true&format=png`);

	function handleDownloadCard() {
		isDownloading = true;
		setTimeout(() => {
			try {
				const doc = new jsPDF({
					orientation: 'landscape',
					unit: 'mm',
					format: [85.6, 53.98]
				});

				// Card top blue bg
				doc.setFillColor(37, 99, 235);
				doc.rect(0, 0, 85.6, 53.98, 'F');
				
				// Card bottom white bg
				doc.setFillColor(255, 255, 255);
				doc.rect(0, 15, 85.6, 38.98, 'F');

				doc.setTextColor(255, 255, 255);
				doc.setFontSize(10);
				doc.setFont('helvetica', 'bold');
				doc.text('KARTU TANDA MAHASISWA', 42.8, 8, { align: 'center' });
				doc.setFontSize(6);
				doc.text('UNIVERSITAS NUSANTARA', 42.8, 12, { align: 'center' });

				// Photo placeholder fallback
				doc.setFillColor(226, 232, 240);
				doc.rect(5, 18, 20, 25, 'F');
				
				// Actual Photo
				try {
					// Use 'PNG' or 'JPEG' depending on the data
					const imgFormat = profileImageUrl.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
					doc.addImage(profileImageUrl, imgFormat, 5, 18, 20, 25);
				} catch(err) {
					// ignore if image fails to load in PDF
					console.error("Failed to add image to PDF", err);
				}

				doc.setTextColor(51, 65, 85);
				doc.setFontSize(8);
				doc.setFont('helvetica', 'bold');
				doc.text(student.name.toUpperCase(), 30, 22);
				
				doc.setFontSize(6);
				doc.setFont('helvetica', 'normal');
				doc.text(student.nim, 30, 26);
				doc.text(student.prodi, 30, 30);
				doc.text(student.fakultas, 30, 34);

				doc.save(`KTM_${student.nim}.pdf`);
				toast.add('Kartu Tanda Mahasiswa (KTM) berhasil diunduh dalam format PDF!', 'success');
			} catch (e) {
				toast.add('Gagal membuat PDF', 'error');
			} finally {
				isDownloading = false;
			}
		}, 800);
	}

	function handlePhotoChange(e: any) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					profileImageUrl = event.target.result as string;
					toast.add('Foto profil berhasil diperbarui!', 'success');
					showEditPhoto = false;
				}
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<svelte:head>
	<title>Biodata Mahasiswa | SIAT</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 scroll-smooth bg-slate-50">
	
	<!-- Page Header -->
	<div class="flex items-center justify-between shrink-0">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">Biodata Mahasiswa</h1>
			<p class="text-sm text-slate-500 mt-1">Kelola informasi profil dan data diri Anda di sini.</p>
		</div>
		<button 
			onclick={() => showEditProfile = true}
			class="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm hover:shadow-blue-500/30 transition-all"
		>
			<Edit3 class="w-4 h-4 mr-2" />
			Edit Profil
		</button>
	</div>

	<!-- Layout Container -->
	<div class="w-full max-w-5xl mx-auto space-y-6">
		
		<!-- Top Area: Profile Summary Centered -->
		<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
			<!-- Cover Background -->
			<div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
				<!-- Optional Decorative Pattern -->
				<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
			</div>
			
			<!-- Avatar -->
			<div class="flex justify-center -mt-16 relative z-10">
				<div class="relative">
					<img 
						src={profileImageUrl} 
						alt="Profile" 
						class="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white object-cover"
					/>
					<!-- Status Badge -->
					<div class="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full" title="Status: Aktif"></div>
				</div>
			</div>
			
			<!-- Basic Info -->
			<div class="p-6 pt-4 text-center">
				<h2 class="text-2xl font-bold text-slate-800 tracking-tight">{student.name}</h2>
				<p class="text-sm text-slate-500 font-mono mt-1">{student.nim}</p>
				
				<div class="mt-4 flex flex-wrap justify-center gap-3">
					<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
						{student.prodi}
					</span>
					<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
						{student.fakultas}
					</span>
				</div>
			</div>

			<div class="border-t border-slate-100 p-4 bg-slate-50/50 flex flex-wrap justify-center gap-4">
				<button 
					onclick={() => showEditPhoto = true}
					class="py-2.5 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors flex items-center justify-center"
				>
					<Edit3 class="w-4 h-4 mr-2 text-slate-500" />
					Ubah Foto
				</button>
				<button 
					onclick={handleDownloadCard}
					disabled={isDownloading}
					class="py-2.5 px-5 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center justify-center group disabled:opacity-50"
				>
					{#if isDownloading}
						<div class="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
						Mengunduh...
					{:else}
						<Download class="w-4 h-4 mr-2 text-blue-500 group-hover:animate-bounce" />
						Unduh Kartu Mahasiswa
					{/if}
				</button>
			</div>
		</div>

		<!-- Bottom Area: Detailed Info Cards Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
			
			<!-- Card 1: Informasi Pribadi -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
				<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
					<User class="w-5 h-5 text-indigo-500 mr-3" />
					<h3 class="text-lg font-bold text-slate-800">Informasi Pribadi</h3>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-2 gap-y-6 gap-x-6">
						<div class="col-span-2">
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">NIK (Nomor Induk Kependudukan)</p>
							<p class="text-sm font-medium text-slate-800 mt-1">{personalInfo.nik}</p>
						</div>
						<div>
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tempat, Tanggal Lahir</p>
							<p class="text-sm font-medium text-slate-800 mt-1">{personalInfo.tempatLahir},<br>{personalInfo.tanggalLahir}</p>
						</div>
						<div>
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jenis Kelamin</p>
							<p class="text-sm font-medium text-slate-800 mt-1">{personalInfo.jenisKelamin}</p>
						</div>
						<div>
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Agama</p>
							<p class="text-sm font-medium text-slate-800 mt-1">{personalInfo.agama}</p>
						</div>
						<div>
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Golongan / Kewarganegaraan</p>
							<p class="text-sm font-medium text-slate-800 mt-1">{personalInfo.golonganDarah} / {personalInfo.kewarganegaraan}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Card 2: Informasi Kontak & Domisili -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
				<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
					<MapPin class="w-5 h-5 text-emerald-500 mr-3" />
					<h3 class="text-lg font-bold text-slate-800">Informasi Kontak & Domisili</h3>
				</div>
				<div class="p-6 space-y-5">
					<div class="space-y-4">
						<div class="flex items-start">
							<Mail class="w-4 h-4 text-slate-400 mt-0.5 mr-3 shrink-0" />
							<div>
								<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Institusi</p>
								<p class="text-sm font-medium text-blue-600 mt-0.5">{contactInfo.email}</p>
							</div>
						</div>
						<div class="flex items-start">
							<Mail class="w-4 h-4 text-slate-400 mt-0.5 mr-3 shrink-0" />
							<div>
								<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Pribadi</p>
								<p class="text-sm font-medium text-slate-800 mt-0.5">{contactInfo.emailPribadi}</p>
							</div>
						</div>
						<div class="flex items-start">
							<Phone class="w-4 h-4 text-slate-400 mt-0.5 mr-3 shrink-0" />
							<div>
								<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nomor Handphone (WhatsApp)</p>
								<p class="text-sm font-medium text-slate-800 mt-0.5">{contactInfo.noHp}</p>
							</div>
						</div>
					</div>
					
					<hr class="border-slate-100">
					
					<div class="space-y-4">
						<div>
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Alamat Asal (Sesuai KTP)</p>
							<p class="text-sm text-slate-800 mt-1 leading-snug">{contactInfo.alamatAsal}</p>
						</div>
						<div>
							<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Alamat Domisili Sekarang</p>
							<p class="text-sm text-slate-800 mt-1 leading-snug">{contactInfo.alamatDomisili}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Card 3: Data Akademik -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
				<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
					<GraduationCap class="w-5 h-5 text-amber-500 mr-3" />
					<h3 class="text-lg font-bold text-slate-800">Data Akademik</h3>
				</div>
				<div class="p-6 grid grid-cols-2 gap-y-6 gap-x-6">
					<div>
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status Mahasiswa</p>
						<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 mt-1.5">
							<ShieldCheck class="w-3 h-3 mr-1" /> {student.status}
						</span>
					</div>
					<div>
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jalur Masuk</p>
						<p class="text-sm font-medium text-slate-800 mt-1.5">{student.jalurMasuk}</p>
					</div>
					<div>
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tahun Masuk</p>
						<p class="text-sm font-medium text-slate-800 mt-1.5">{student.tahunMasuk}</p>
					</div>
					<div class="col-span-2 pt-2">
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dosen Wali / Pendamping Akademik</p>
						<div class="flex items-center mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
							<BookOpen class="w-5 h-5 text-blue-500 mr-3 shrink-0" />
							<p class="text-sm font-bold text-slate-800">{student.dosenWali}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Card 4: Data Orang Tua -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
				<div class="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
					<div class="flex items-center">
						<Users class="w-5 h-5 text-rose-500 mr-3" />
						<h3 class="text-lg font-bold text-slate-800">Data Orang Tua / Wali</h3>
					</div>
				</div>
				<div class="p-6 grid grid-cols-2 gap-y-6 gap-x-6">
					<div class="col-span-2">
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama Ayah</p>
						<p class="text-sm font-medium text-slate-800 mt-1">{parentInfo.namaAyah}</p>
						<p class="text-xs text-slate-400 mt-0.5">Pekerjaan: {parentInfo.pekerjaanAyah}</p>
					</div>
					<div class="col-span-2">
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama Ibu</p>
						<p class="text-sm font-medium text-slate-800 mt-1">{parentInfo.namaIbu}</p>
						<p class="text-xs text-slate-400 mt-0.5">Pekerjaan: {parentInfo.pekerjaanIbu}</p>
					</div>
					<div class="col-span-2 pt-2 border-t border-slate-100">
						<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Nomor Telepon Darurat (Orang Tua/Wali)</p>
						<div class="flex items-center mt-2">
							<Phone class="w-4 h-4 text-rose-500 mr-2 shrink-0" />
							<p class="text-sm font-bold text-rose-600">{parentInfo.noTeleponDarurat}</p>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>

<!-- MODAL EDIT PROFIL -->
{#if showEditProfile}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade>
		<div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" transition:scale>
			<div class="bg-blue-600 p-6 text-white flex justify-between items-center">
				<div class="flex items-center space-x-3">
					<Edit3 class="w-6 h-6" />
					<h3 class="text-xl font-bold">Edit Profil Mahasiswa</h3>
				</div>
				<button onclick={() => showEditProfile = false} class="text-white/70 hover:text-white">
					<X class="w-6 h-6" />
				</button>
			</div>
			
			<form method="POST" action="?/updateProfile" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.add('Profil berhasil diperbarui!', 'success');
						showEditProfile = false;
					} else {
						toast.add('Gagal memperbarui profil.', 'error');
					}
				};
			}} class="p-8 space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Pribadi</label>
						<input type="email" name="emailPribadi" bind:value={contactInfo.emailPribadi} class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
					</div>
					<div class="space-y-2">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Nomor Handphone</label>
						<input type="text" name="noHp" bind:value={contactInfo.noHp} class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
					</div>
					<div class="md:col-span-2 space-y-2">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Alamat Domisili</label>
						<textarea name="alamatDomisili" bind:value={contactInfo.alamatDomisili} rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
					</div>
				</div>

				<div class="flex space-x-4 pt-4">
					<button type="button" onclick={() => showEditProfile = false} class="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Batal</button>
					<button type="submit" class="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Simpan Perubahan</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- MODAL UBAH FOTO -->
{#if showEditPhoto}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade>
		<div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center" transition:scale>
			<div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
				<User class="w-10 h-10" />
			</div>
			<h3 class="text-xl font-bold text-slate-800">Ubah Foto Profil</h3>
			<p class="text-sm text-slate-500 mt-2 mb-8">Pilih foto terbaru Anda. Pastikan wajah terlihat jelas dengan latar belakang polos.</p>
			
			<div class="space-y-4">
				<label class="block w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
					<input type="file" class="hidden" onchange={handlePhotoChange} accept="image/*">
					<p class="text-sm font-bold text-slate-600">Klik untuk pilih file</p>
					<p class="text-[10px] text-slate-400 mt-1">JPG, PNG atau WebP (Max. 2MB)</p>
				</label>
				<button onclick={() => showEditPhoto = false} class="w-full py-3.5 text-slate-500 font-bold">Batal</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Animation for the download icon */
	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-3px); }
	}
	.group:hover .group-hover\:animate-bounce {
		animation: bounce 0.6s infinite;
	}
</style>

