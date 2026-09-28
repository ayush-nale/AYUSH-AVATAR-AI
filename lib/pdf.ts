export const handleDownloadPdf = async (pdfContent: string) => {
  try {
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.createElement('div');
    
    // Basic markdown to HTML conversion for the PDF
    let htmlContent = pdfContent
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #222;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; color: #333;">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n/gim, '<br/>');

    element.innerHTML = `<div style="padding: 40px; font-family: Helvetica, Arial, sans-serif; color: #000; background: #fff; line-height: 1.6;">${htmlContent}</div>`;
    
    const opt = {
      margin:       0.5,
      filename:     'AI_Ayush_Document.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
};
