import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PDFGenerator = async (formData) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([780, 1200]); // Increased height for more content

  const { date, firmName, partners, businessActivity, businessAddress, signatories } = formData;

  // Define some font styles
  const titleFontSize = 20;
  const headerFontSize = 16;
  const textFontSize = 10;

  // Embed the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Helper function to add text with wrapping
  const addText = (text, x, y, fontSize = textFontSize, maxWidth = 680) => {
    const words = text.split(' ');
    let line = '';
    let lineHeight = fontSize + 2;
    let newY = y;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testLineWidth > maxWidth && n > 0) {
        page.drawText(line, { x, y: newY, size: fontSize, font, color: rgb(0, 0, 0) });
        line = words[n] + ' ';
        newY -= lineHeight;
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x, y: newY, size: fontSize, font, color: rgb(0, 0, 0) });
    return newY;
  };

  // Add the date and firm name
  addText(`Date: ${date}`, 50, 1150, titleFontSize);
  addText(`Firm Name: ${firmName}`, 50, 1125, titleFontSize);

  // Add a heading for the partners table
  addText('Partners Details:', 50, 1080, headerFontSize);

  // Add partners details table
  let tableY = 1050;
  const rowHeight = 15;
  const columnWidth = 95;

  // Add table headers
  const headers = ['Name', 'Son/Daughter of', 'Aadhar Number', 'Initial Capital', 'Profit Share (%)', 'Salary', 'Address'];
  headers.forEach((header, i) => {
    addText(header, 50 + i * columnWidth, tableY, textFontSize);
  });

  // Add rows
  partners.forEach((partner, rowIndex) => {
    tableY -= rowHeight;
    Object.values(partner).forEach((value, colIndex) => {
      tableY = addText(value.toString(), 50 + colIndex * columnWidth, tableY, textFontSize);
    });
  });

  // Add business activity description
  tableY -= rowHeight;
  tableY = addText('Business Activity Description:', 50, tableY - 20, headerFontSize);
  tableY = addText(businessActivity, 50, tableY - 20, textFontSize);

  // Add business address
  tableY -= 60;
  tableY = addText('Business Address:', 50, tableY, headerFontSize);
  tableY = addText(businessAddress, 50, tableY - 20, textFontSize);

  // Add signatory details
  tableY -= 60;
  addText('Signatories:', 50, tableY, headerFontSize);
  signatories.forEach((signatory, index) => {
    tableY = addText(`- ${signatory}`, 50, tableY - 20, textFontSize);
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create a blob and download the PDF
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Partnership_Deed.pdf';
  link.click();
};

export default PDFGenerator;



