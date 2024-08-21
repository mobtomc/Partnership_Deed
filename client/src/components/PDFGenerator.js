import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PDFGenerator = async (formData) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 1000;
  const pageHeight = 1200;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  const { date, firmName, partners, businessActivity, businessAddress, signatories } = formData;

  // Define some font styles
  const titleFontSize = 20;
  const headerFontSize = 16;
  const textFontSize = 10;

  // Embed the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Helper function to add text with wrapping and center alignment
  const addTextCentered = (text, x, y, fontSize = textFontSize, maxWidth = 950) => {
    const words = text.split(' ');
    let line = '';
    let lineHeight = fontSize + 2;
    let newY = y;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testLineWidth > maxWidth && n > 0) {
        page.drawText(line, { x: x - (font.widthOfTextAtSize(line, fontSize) / 2), y: newY, size: fontSize, font, color: rgb(0, 0, 0) });
        line = words[n] + ' ';
        newY -= lineHeight;
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x: x - (font.widthOfTextAtSize(line, fontSize) / 2), y: newY, size: fontSize, font, color: rgb(0, 0, 0) });
    return newY;
  };

  // Start content placement closer to the top
  const marginTop = 100;
  let currentY = pageHeight - marginTop;

  // Add the date and firm name
  currentY = addTextCentered(`Date: ${date}`, pageWidth / 2, currentY, titleFontSize);
  currentY = addTextCentered(`Firm Name: ${firmName}`, pageWidth / 2, currentY - 30, titleFontSize);

  // Add a heading for the partners table
  currentY -= 60; // Adjust position for heading
  currentY = addTextCentered('Partners Details:', pageWidth / 2, currentY, headerFontSize);

  // Add partners details table
  currentY -= 60; // Adjust table position from heading
  const rowHeight = 15;
  const columnWidth = 120;

  // Add table headers
  const headers = ['Name', 'Son/Daughter of', 'Aadhar Number', 'Initial Capital', 'Profit Share (%)', 'Salary', 'Address'];
  headers.forEach((header, i) => {
    addTextCentered(header, pageWidth / 2 - (headers.length * columnWidth / 2) + i * columnWidth, currentY, textFontSize);
  });

  // Add rows
  partners.forEach((partner) => {
    currentY -= rowHeight;
    // Assuming the partner object might have an unwanted property like '_id'
    const { _id, ...partnerDetails } = partner;
    Object.values(partnerDetails).forEach((value, colIndex) => {
      addTextCentered(value.toString(), pageWidth / 2 - (headers.length * columnWidth / 2) + colIndex * columnWidth, currentY, textFontSize);
    });
  });

  // Add business activity description
  currentY -= 60;
  currentY = addTextCentered('Business Activity Description:', pageWidth / 2, currentY, headerFontSize);
  currentY -= 30;
  currentY = addTextCentered(businessActivity, pageWidth / 2, currentY, textFontSize);

  // Add business address
  currentY -= 60;
  currentY = addTextCentered('Business Address:', pageWidth / 2, currentY, headerFontSize);
  currentY -= 30;
  currentY = addTextCentered(businessAddress, pageWidth / 2, currentY, textFontSize);

  // Add signatory details
  currentY -= 60;
  currentY = addTextCentered('Signatories:', pageWidth / 2, currentY, headerFontSize);
  signatories.forEach((signatory) => {
    currentY -= 30;
    addTextCentered(`- ${signatory}`, pageWidth / 2, currentY, textFontSize);
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
