<script lang="ts">
    import { 
        FileText, 
        Download, 
        TrendingUp, 
        Award, 
        BookOpen, 
        ChevronDown,
        Calendar,
        CheckCircle2,
        Printer,
        Info
    } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { toast } from '$lib/stores/toast';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';

    let { data } = $props();

    // Tabs logic
    let activeTab = $state('khs');

    // KHS logic
    let selectedSemester = $state(data.currentStudent?.semester?.toString() || '4');
    
    let academicStats = $derived(data.academicStats);

    const semesterLabels: Record<string, string> = {
        '1': 'Semester 1 (Ganjil)',
        '2': 'Semester 2 (Genap)',
        '3': 'Semester 3 (Ganjil)',
        '4': 'Semester 4 (Genap)',
        '5': 'Semester 5 (Ganjil)',
        '6': 'Semester 6 (Genap)',
        '7': 'Semester 7 (Ganjil)',
        '8': 'Semester 8 (Genap)',
    };

    let khsData = $derived(data.khsData);

    let currentKHS = $derived(khsData[selectedSemester] || []);
    let semesterSks = $derived(currentKHS.reduce((acc, curr) => acc + curr.sks, 0));
    let semesterIPS = $derived(() => {
        const total = currentKHS.reduce((acc, curr) => acc + curr.bobot * curr.sks, 0);
        return semesterSks > 0 ? total / semesterSks : 0;
    });

    function getGradeColor(grade: string) {
        if (grade.startsWith('A')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (grade.startsWith('C')) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    }

    // ── Helper: draw header block ──────────────────────────────────────────────
    function drawDocHeader(doc: jsPDF, title: string) {
        const pageW = doc.internal.pageSize.getWidth();
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageW, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('UNIVERSITAS NUSANTARA', pageW / 2, 10, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(title, pageW / 2, 18, { align: 'center' });
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(14, 32, pageW - 14, 32);
        doc.setTextColor(0, 0, 0);
    }

    // ── Helper: draw student info block ───────────────────────────────────────
    function drawStudentInfo(doc: jsPDF, extraLine?: string): number {
        const student = data.currentStudent;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Nama             : ${student.name}`, 14, 40);
        doc.text(`NIM               : ${student.nim}`, 14, 47);
        doc.text(`Program Studi : Teknik Informatika`, 14, 54);
        if (extraLine) {
            doc.text(extraLine, 14, 61);
            return 68;
        }
        return 62;
    }

    // ── Export KHS Semester PDF ────────────────────────────────────────────────
    function exportKHSPDF() {
        try {
            const doc = new jsPDF();
            const semLabel = semesterLabels[selectedSemester] ?? `Semester ${selectedSemester}`;
            const ips = semesterIPS();

            drawDocHeader(doc, 'KARTU HASIL STUDI (KHS)');
            const tableStartY = drawStudentInfo(doc, `Semester      : ${semLabel}`);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(37, 99, 235);
            doc.text(`IPS: ${ips.toFixed(2)}   |   Total SKS: ${semesterSks}`, 14, tableStartY - 2);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');

            autoTable(doc, {
                startY: tableStartY + 2,
                head: [['No.', 'Kode MK', 'Nama Mata Kuliah', 'SKS', 'Nilai', 'Bobot']],
                body: currentKHS.map((item, i) => [
                    i + 1, item.kode, item.nama, item.sks, item.nilai, item.bobot.toFixed(2)
                ]),
                foot: [['', '', 'Total', semesterSks, '', ips.toFixed(2)]],
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235], fontSize: 9, fontStyle: 'bold' },
                footStyles: { fillColor: [240, 245, 255], textColor: [37, 99, 235], fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 12, halign: 'center' },
                    3: { cellWidth: 14, halign: 'center' },
                    4: { cellWidth: 18, halign: 'center' },
                    5: { cellWidth: 18, halign: 'center' }
                },
                margin: { left: 14, right: 14 },
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text('Dokumen ini digenerate secara otomatis oleh Sistem Informasi Akademik Terpadu (SIAT).', 14, finalY);

            doc.save(`KHS_Semester_${selectedSemester}_${data.currentStudent.nim}.pdf`);
            toast.add('KHS berhasil diekspor sebagai PDF!', 'success');
        } catch (e) {
            console.error(e);
            toast.add('Gagal mengekspor KHS PDF', 'error');
        }
    }

    // ── Export Transkrip PDF ───────────────────────────────────────────────────
    function exportTranscriptPDF() {
        try {
            const doc = new jsPDF();
            drawDocHeader(doc, 'TRANSKRIP NILAI AKADEMIK');
            let startY = drawStudentInfo(doc, `IPK Kumulatif : ${academicStats.ipk.toFixed(2)}`);

            data.transcript.forEach((sem: any, idx: number) => {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(37, 99, 235);
                doc.text(`Semester ${sem.semester}   |   IPS: ${sem.gpa.toFixed(2)}`, 14, startY + 2);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');

                const semSks = sem.courses.reduce((a: number, c: any) => a + c.sks, 0);

                autoTable(doc, {
                    startY: startY + 6,
                    head: [['Kode', 'Nama Mata Kuliah', 'SKS', 'Nilai', 'Angka']],
                    body: sem.courses.map((c: any) => [c.kode, c.nama, c.sks, c.nilai, c.angka?.toFixed(2) ?? '-']),
                    foot: [['', 'Total SKS Semester', semSks, '', '']],
                    theme: 'striped',
                    headStyles: { fillColor: [37, 99, 235], fontSize: 8, fontStyle: 'bold' },
                    footStyles: { fillColor: [240, 245, 255], textColor: [37, 99, 235], fontStyle: 'bold', fontSize: 8 },
                    bodyStyles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 28 },
                        2: { cellWidth: 14, halign: 'center' },
                        3: { cellWidth: 16, halign: 'center' },
                        4: { cellWidth: 18, halign: 'center' }
                    },
                    margin: { left: 14, right: 14 },
                });

                startY = (doc as any).lastAutoTable.finalY + 10;

                if (idx < data.transcript.length - 1 && startY > 230) {
                    doc.addPage();
                    startY = 20;
                }
            });

            // Summary bar
            const pageW = doc.internal.pageSize.getWidth();
            doc.setFillColor(37, 99, 235);
            doc.rect(14, startY, pageW - 28, 14, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`Total SKS Lulus: ${academicStats.sksLulus}  |  IPK: ${academicStats.ipk.toFixed(2)}  |  Status: Aktif / Normal`, pageW / 2, startY + 9, { align: 'center' });

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.setFont('helvetica', 'normal');
            doc.text('Dokumen ini digenerate secara otomatis oleh Sistem Informasi Akademik Terpadu (SIAT).', 14, startY + 22);

            doc.save(`Transkrip_Nilai_${data.currentStudent.nim}.pdf`);
            toast.add('Transkrip nilai berhasil diekspor!', 'success');
        } catch (e) {
            console.error(e);
            toast.add('Gagal mengekspor PDF', 'error');
        }
    }

    // ── Helper: buka PDF di tab baru lalu trigger print dialog ────────────────
    function openPrintDialog(doc: jsPDF) {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const printWin = window.open(url, '_blank');
        if (printWin) {
            printWin.onload = () => {
                printWin.focus();
                printWin.print();
                // Revoke URL setelah dialog dibuka
                setTimeout(() => URL.revokeObjectURL(url), 10000);
            };
        } else {
            // Popup diblokir browser — fallback ke download
            URL.revokeObjectURL(url);
            toast.add('Pop-up diblokir browser. Gunakan tombol Export PDF untuk mendownload.', 'error');
        }
    }

    // ── Cetak KHS: buka print dialog (BUKAN download) ─────────────────────────
    function printKHSPDF() {
        try {
            const doc = new jsPDF();
            const semLabel = semesterLabels[selectedSemester] ?? `Semester ${selectedSemester}`;
            const ips = semesterIPS();

            drawDocHeader(doc, 'KARTU HASIL STUDI (KHS)');
            const tableStartY = drawStudentInfo(doc, `Semester      : ${semLabel}`);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(37, 99, 235);
            doc.text(`IPS: ${ips.toFixed(2)}   |   Total SKS: ${semesterSks}`, 14, tableStartY - 2);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');

            autoTable(doc, {
                startY: tableStartY + 2,
                head: [['No.', 'Kode MK', 'Nama Mata Kuliah', 'SKS', 'Nilai', 'Bobot']],
                body: currentKHS.map((item, i) => [
                    i + 1, item.kode, item.nama, item.sks, item.nilai, item.bobot.toFixed(2)
                ]),
                foot: [['', '', 'Total', semesterSks, '', ips.toFixed(2)]],
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235], fontSize: 9, fontStyle: 'bold' },
                footStyles: { fillColor: [240, 245, 255], textColor: [37, 99, 235], fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 12, halign: 'center' },
                    3: { cellWidth: 14, halign: 'center' },
                    4: { cellWidth: 18, halign: 'center' },
                    5: { cellWidth: 18, halign: 'center' }
                },
                margin: { left: 14, right: 14 },
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text('Dokumen ini digenerate secara otomatis oleh Sistem Informasi Akademik Terpadu (SIAT).', 14, finalY);

            openPrintDialog(doc);
        } catch (e) {
            console.error(e);
            toast.add('Gagal membuka dialog cetak', 'error');
        }
    }

    // ── Cetak Transkrip: buka print dialog (BUKAN download) ───────────────────
    function printTranscriptPDF() {
        try {
            const doc = new jsPDF();
            drawDocHeader(doc, 'TRANSKRIP NILAI AKADEMIK');
            let startY = drawStudentInfo(doc, `IPK Kumulatif : ${academicStats.ipk.toFixed(2)}`);

            data.transcript.forEach((sem: any, idx: number) => {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(37, 99, 235);
                doc.text(`Semester ${sem.semester}   |   IPS: ${sem.gpa.toFixed(2)}`, 14, startY + 2);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');

                const semSks = sem.courses.reduce((a: number, c: any) => a + c.sks, 0);

                autoTable(doc, {
                    startY: startY + 6,
                    head: [['Kode', 'Nama Mata Kuliah', 'SKS', 'Nilai', 'Angka']],
                    body: sem.courses.map((c: any) => [c.kode, c.nama, c.sks, c.nilai, c.angka?.toFixed(2) ?? '-']),
                    foot: [['', 'Total SKS Semester', semSks, '', '']],
                    theme: 'striped',
                    headStyles: { fillColor: [37, 99, 235], fontSize: 8, fontStyle: 'bold' },
                    footStyles: { fillColor: [240, 245, 255], textColor: [37, 99, 235], fontStyle: 'bold', fontSize: 8 },
                    bodyStyles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 28 },
                        2: { cellWidth: 14, halign: 'center' },
                        3: { cellWidth: 16, halign: 'center' },
                        4: { cellWidth: 18, halign: 'center' }
                    },
                    margin: { left: 14, right: 14 },
                });

                startY = (doc as any).lastAutoTable.finalY + 10;

                if (idx < data.transcript.length - 1 && startY > 230) {
                    doc.addPage();
                    startY = 20;
                }
            });

            const pageW = doc.internal.pageSize.getWidth();
            doc.setFillColor(37, 99, 235);
            doc.rect(14, startY, pageW - 28, 14, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`Total SKS Lulus: ${academicStats.sksLulus}  |  IPK: ${academicStats.ipk.toFixed(2)}  |  Status: Aktif / Normal`, pageW / 2, startY + 9, { align: 'center' });

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.setFont('helvetica', 'normal');
            doc.text('Dokumen ini digenerate secara otomatis oleh Sistem Informasi Akademik Terpadu (SIAT).', 14, startY + 22);

            openPrintDialog(doc);
        } catch (e) {
            console.error(e);
            toast.add('Gagal membuka dialog cetak', 'error');
        }
    }
</script>

<svelte:head>
    <title>KHS & Transkrip | SIAT</title>
</svelte:head>

<div class="h-full flex flex-col p-6 overflow-y-auto space-y-6 scroll-smooth bg-slate-50">
    
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                <FileText class="w-7 h-7 mr-3 text-blue-600" />
                KHS & Transkrip Akademik
            </h1>
            <p class="text-sm text-slate-500 mt-1">Pantau hasil studi dan pencapaian akademik Anda.</p>
        </div>
        
        <div class="flex items-center space-x-3">
            <div class="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
                <button 
                    onclick={() => activeTab = 'khs'}
                    class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all {activeTab === 'khs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}"
                >
                    KHS Semester
                </button>
                <button 
                    onclick={() => activeTab = 'transcript'}
                    class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all {activeTab === 'transcript' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}"
                >
                    Transkrip Nilai
                </button>
            </div>
            <!-- Tombol Cetak: buka dialog print browser -->
            <button 
                onclick={() => activeTab === 'khs' ? printKHSPDF() : printTranscriptPDF()}
                class="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
            >
                <Printer class="w-4 h-4 mr-2" />
                Cetak
            </button>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <TrendingUp class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">IP Kumulatif (IPK)</p>
                    <p class="text-2xl font-black text-slate-800">{academicStats.ipk.toFixed(2)}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <Award class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">IP Semester (IPS)</p>
                    <p class="text-2xl font-black text-slate-800">{academicStats.ips.toFixed(2)}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <BookOpen class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">SKS Lulus</p>
                    <p class="text-2xl font-black text-slate-800">{academicStats.sksLulus} <span class="text-sm font-normal text-slate-400">/ {academicStats.sksTotal}</span></p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <CheckCircle2 class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Status Akademik</p>
                    <p class="text-xl font-black text-emerald-600">Aktif / Normal</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Content Section -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {#if activeTab === 'khs'}
            <div class="p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4" in:fade>
                <div class="flex items-center">
                    <Calendar class="w-5 h-5 text-blue-500 mr-2" />
                    <h3 class="text-lg font-bold text-slate-800">Kartu Hasil Studi (KHS)</h3>
                </div>
                
                <div class="flex items-center space-x-3">
                    <span class="text-sm text-slate-500">Pilih Semester:</span>
                    <div class="relative min-w-[160px]">
                        <select 
                            bind:value={selectedSemester}
                            class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="4">Semester 4 (Genap)</option>
                            <option value="3">Semester 3 (Ganjil)</option>
                            <option value="2">Semester 2 (Genap)</option>
                            <option value="1">Semester 1 (Ganjil)</option>
                        </select>
                        <ChevronDown class="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <!-- Export PDF KHS Semester -->
                    <button 
                        onclick={exportKHSPDF}
                        class="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                    >
                        <Download class="w-3 h-3 mr-2" />
                        Export PDF
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto flex-1" in:fade>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                            <th class="px-6 py-4 w-16">No.</th>
                            <th class="px-6 py-4">Kode MK</th>
                            <th class="px-6 py-4">Nama Mata Kuliah</th>
                            <th class="px-6 py-4 text-center">SKS</th>
                            <th class="px-6 py-4 text-center">Nilai</th>
                            <th class="px-6 py-4 text-center">Bobot</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        {#each currentKHS as item, i (item.kode)}
                            <tr class="hover:bg-slate-50/50 transition-colors group">
                                <td class="px-6 py-4 text-sm text-slate-400 font-medium">{i + 1}</td>
                                <td class="px-6 py-4 text-sm font-mono text-slate-500">{item.kode}</td>
                                <td class="px-6 py-4">
                                    <p class="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.nama}</p>
                                </td>
                                <td class="px-6 py-4 text-sm text-center font-semibold text-slate-600">{item.sks}</td>
                                <td class="px-6 py-4 text-center">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border {getGradeColor(item.nilai)}">
                                        {item.nilai}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-center text-slate-500">{(item.bobot ?? 0).toFixed(2)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {:else}
            <div class="p-5 border-b border-slate-100 bg-white flex items-center justify-between" in:fade>
                <div class="flex items-center">
                    <Award class="w-5 h-5 text-amber-500 mr-2" />
                    <h3 class="text-lg font-bold text-slate-800">Transkrip Nilai Kumulatif</h3>
                </div>
                <button onclick={exportTranscriptPDF} class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center">
                    <Download class="w-3 h-3 mr-2" />
                    Export PDF
                </button>
            </div>

            <div class="p-6 space-y-8" in:fade>
                {#each data.transcript as sem}
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h4 class="text-sm font-black text-slate-700 uppercase tracking-widest">Semester {sem.semester}</h4>
                            <span class="text-xs font-bold text-slate-400">IPS: {sem.gpa.toFixed(2)}</span>
                        </div>
                        <div class="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-100/50 text-slate-500 font-bold">
                                    <tr>
                                        <th class="px-4 py-2 w-24">Kode</th>
                                        <th class="px-4 py-2">Mata Kuliah</th>
                                        <th class="px-4 py-2 text-center w-16">SKS</th>
                                        <th class="px-4 py-2 text-center w-16">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    {#each sem.courses as c}
                                        <tr>
                                            <td class="px-4 py-2 font-mono text-slate-400">{c.kode}</td>
                                            <td class="px-4 py-2 font-medium text-slate-700">{c.nama}</td>
                                            <td class="px-4 py-2 text-center text-slate-600">{c.sks}</td>
                                            <td class="px-4 py-2 text-center">
                                                <span class="font-black {c.nilai.startsWith('A') ? 'text-emerald-600' : 'text-blue-600'}">{c.nilai}</span>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        
        <div class="p-5 bg-blue-50/30 border-t border-blue-50 flex items-start space-x-3 mt-auto">
            <Info class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p class="text-xs text-blue-700 leading-relaxed">
                <strong>Catatan:</strong> Data transkrip di atas mencakup seluruh mata kuliah yang telah ditempuh dari semester awal hingga semester terakhir yang telah divalidasi.
            </p>
        </div>
    </div>

</div>
