// server/utils/admin/general/generateEnvelopePDF.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateEnvelopePDF = async (res, { sender, receivers }) => {
  const doc = new PDFDocument({ size: 'letter', layout: 'landscape', margin: 40 });

  const fontPath = path.resolve('public/fonts/cour.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=envelope.pdf');
  doc.pipe(res);

  receivers.forEach((receiver, idx) => {
    if (idx > 0) doc.addPage();

    // Sender 주소 출력
    if (sender && sender.sname) {
      const senderX = 120;
      const senderY = 170;
      const senderWidth = 140;


      doc.fontSize(10)
        .text(sender.sname, senderX, senderY, { width: senderWidth, align: 'center' })
        .text(sender.sstreet, senderX, senderY + 15,{ width: senderWidth, align: 'center' })
        .text(`${sender.scity}, ${sender.sstate} ${sender.szip}`, senderX, senderY + 30, { width: senderWidth, align: 'center' });
    }

    if (receiver.rcode && receiver.rcode.startsWith('E')) {
      // rcode가 'E'로 시작하면 하단 중앙에 rname만 출력
      doc.fontSize(13).text(receiver.rname, 550, 410);
    } else {
      // 전체 주소 블럭 중앙에 출력
      const baseX = 350;
      const baseY = 280;
      const baseWidth = 300; // 수신자 주소 블럭 너비 조정 (글씨가 겹칠 때)

      doc.fontSize(13)
        .text(receiver.rname, baseX, baseY, { width: baseWidth, align: 'center' })
        .text(receiver.ratt, baseX, baseY + 18, { width: baseWidth, align: 'center' })
        .text(receiver.rstreet, baseX, baseY + 36, { width: baseWidth, align: 'center' })
        .text(`${receiver.rcity}, ${receiver.rstate} ${receiver.rzip}`, baseX, baseY + 51, { width: baseWidth, align: 'center' });
    }
  });

  doc.end();
};

module.exports = generateEnvelopePDF;