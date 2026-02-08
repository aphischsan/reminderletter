const { jsPDF } = window.jspdf;

const form = document.getElementById('letterForm');
const letterType = document.getElementById('letterType');
const r2Fields = document.getElementById('r2Fields');
const r3Fields = document.getElementById('r3Fields');
const logoUpload = document.getElementById('logoUpload');

let logoDataUrl = null;

letterType.addEventListener('change', toggleConditionalFields);
logoUpload.addEventListener('change', handleLogoUpload);
form.addEventListener('submit', generatePdf);

toggleConditionalFields();

function toggleConditionalFields() {
  const type = letterType.value;
  r2Fields.classList.toggle('hidden', type !== 'R2');
  r3Fields.classList.toggle('hidden', type !== 'R3');

  document.getElementById('r1Date').required = type === 'R2';
  document.getElementById('r2Date').required = type === 'R3';
  document.getElementById('daysPresent').required = type === 'R3';
  document.getElementById('schoolDays').required = type === 'R3';
  document.getElementById('attendancePercent').required = type === 'R3';
}

function handleLogoUpload(event) {
  const [file] = event.target.files;
  if (!file) {
    logoDataUrl = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    logoDataUrl = reader.result;
  };
  reader.readAsDataURL(file);
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function writeParagraph(doc, text, x, y, maxWidth, lineHeight = 7) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function drawHeader(doc) {
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 14, 10, 26, 26);
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('SEKOLAH MENENGAH AWANG SEMAUN', 105, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.text('KEMENTERIAN PENDIDIKAN, NEGARA BRUNEI DARUSSALAM', 105, 22, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setLineWidth(0.2);
  doc.line(14, 36, 196, 36);
}

function drawFooter(doc, ccLines) {
  doc.setFont('times', 'normal');
  doc.text('Sekian, terima kasih.', 14, 236);
  doc.text('Yang benar,', 14, 246);

  doc.setFont('times', 'bold');
  doc.text('Pengetua,', 14, 266);
  doc.text('Sekolah Menengah Awang Semaun', 14, 273);

  doc.setFont('times', 'normal');
  doc.text('sk:', 14, 284);
  let y = 290;
  ccLines.forEach((line) => {
    doc.text(`- ${line}`, 18, y);
    y += 6;
  });
}

function generatePdf(event) {
  event.preventDefault();

  const type = letterType.value;
  const data = {
    letterDate: formatDate(document.getElementById('letterDate').value),
    parentName: document.getElementById('parentName').value,
    address: document.getElementById('address').value,
    studentName: document.getElementById('studentName').value,
    studentClass: document.getElementById('studentClass').value,
    absenceDates: document.getElementById('absenceDates').value,
    r1Date: formatDate(document.getElementById('r1Date').value),
    r2Date: formatDate(document.getElementById('r2Date').value),
    daysPresent: document.getElementById('daysPresent').value,
    schoolDays: document.getElementById('schoolDays').value,
    attendancePercent: document.getElementById('attendancePercent').value
  };

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  drawHeader(doc);

  doc.text(`Tarikh: ${data.letterDate}`, 196, 46, { align: 'right' });

  let y = 56;
  doc.text('Yang Mulia,', 14, y);
  y += 7;
  doc.text(data.parentName, 14, y);
  y += 7;

  data.address.split('\n').forEach((line) => {
    doc.text(line, 14, y);
    y += 7;
  });

  y += 3;
  const subject =
    type === 'R1'
      ? 'SURAT PERINGATAN PERTAMA KETIDAKHADIRAN KE SEKOLAH'
      : type === 'R2'
        ? 'SURAT PERINGATAN KEDUA KETIDAKHADIRAN KE SEKOLAH'
        : 'SURAT PERINGATAN TERAKHIR KETIDAKHADIRAN KE SEKOLAH';

  doc.setFont('times', 'bold');
  doc.text(subject, 14, y);
  y += 8;
  doc.setFont('times', 'normal');

  y = writeParagraph(
    doc,
    `Nama Penuntut: ${data.studentName}    Tingkatan/Kelas: ${data.studentClass}`,
    14,
    y,
    180
  );

  y = writeParagraph(doc, `Tarikh tidak hadir: ${data.absenceDates}`, 14, y + 1, 180);
  y += 4;

  if (type === 'R1') {
    y = writeParagraph(
      doc,
      'Dimaklumkan bahawa anak jagaan Yang Mulia telah tidak hadir ke sekolah selama 3 hari tanpa sebab yang munasabah. Pihak sekolah memandang serius perkara ini dan berharap kerjasama Yang Mulia untuk memastikan kehadiran anak jagaan sentiasa teratur.',
      14,
      y,
      180
    );
    y = writeParagraph(
      doc,
      'Perhatian Yang Mulia juga diingatkan bahawa peratus kedatangan minimum ialah 85%. Kegagalan mematuhi syarat ini boleh menjejaskan rekod persekolahan dan tindakan lanjut pihak sekolah.',
      14,
      y + 1,
      180
    );
    drawFooter(doc, ['Fail Persendirian Penuntut']);
  }

  if (type === 'R2') {
    y = writeParagraph(
      doc,
      `Merujuk surat peringatan pertama bertarikh ${data.r1Date}, dimaklumkan bahawa anak jagaan Yang Mulia kini telah tidak hadir ke sekolah selama 7 hari. Keadaan ini amat membimbangkan dan memerlukan tindakan segera daripada pihak Yang Mulia.`,
      14,
      y,
      180
    );
    y = writeParagraph(
      doc,
      'Pihak sekolah sekali lagi menegaskan bahawa peratus kedatangan minimum ialah 85%. Sekiranya ketidakhadiran berterusan, pihak sekolah akan mengambil tindakan susulan mengikut peraturan yang berkuat kuasa.',
      14,
      y + 1,
      180
    );
    drawFooter(doc, ['Fail Persendirian Penuntut']);
  }

  if (type === 'R3') {
    y = writeParagraph(
      doc,
      `Merujuk surat peringatan kedua bertarikh ${data.r2Date}, dimaklumkan bahawa ketidakhadiran anak jagaan Yang Mulia masih berterusan. Surat ini adalah peringatan terakhir daripada pihak sekolah.`,
      14,
      y,
      180
    );
    y = writeParagraph(
      doc,
      'Yang Mulia dikehendaki hadir berjumpa Pengetua dengan kadar segera. Satu surat perjanjian akan ditandatangani bagi memastikan kehadiran penuntut dipantau. Sekiranya masalah ini tidak berubah, kes akan dirujuk kepada Kaunselor dan seterusnya ke Jabatan Sekolah-Sekolah untuk tindakan lanjut.',
      14,
      y + 1,
      180
    );

    y += 3;
    doc.setFont('times', 'bold');
    doc.text('Maklumat Kehadiran Penuntut', 14, y);
    y += 4;
    doc.setFont('times', 'normal');

    const startX = 14;
    const startY = y;
    const col1 = 90;
    const col2 = 40;
    const rowH = 9;

    const rows = [
      ['Jumlah Hari Hadir', data.daysPresent],
      ['Jumlah Hari Persekolahan', data.schoolDays],
      ['Peratus Kedatangan', data.attendancePercent]
    ];

    doc.rect(startX, startY, col1, rowH);
    doc.rect(startX + col1, startY, col2, rowH);
    doc.text('Butiran', startX + 2, startY + 6);
    doc.text('Nilai', startX + col1 + 2, startY + 6);

    rows.forEach((row, index) => {
      const top = startY + rowH * (index + 1);
      doc.rect(startX, top, col1, rowH);
      doc.rect(startX + col1, top, col2, rowH);
      doc.text(row[0], startX + 2, top + 6);
      doc.text(String(row[1]), startX + col1 + 2, top + 6);
    });

    drawFooter(doc, ['Kaunselor', 'Fail Persendirian Penuntut']);
  }

  doc.save(`Surat_${type}_${data.studentName.replace(/\s+/g, '_')}.pdf`);
}
