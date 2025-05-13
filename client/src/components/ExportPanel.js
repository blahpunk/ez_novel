// client/src/components/ExportPanel.js
import React from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useSelector } from 'react-redux';
import { rawToHtml } from '../utils/rawToHtml';

const ExportContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #222;
  text-align: center;
  padding: 10px 0;
  z-index: 9999;

  button {
    margin: 0 5px;
    padding: 5px 10px;
    font-size: 0.9rem;
    background: #00ff99;
    color: #121212;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
`;

// Utility function to sanitize the book title and append date/time.
const generateFilename = (title) => {
  // Replace invalid characters:  \/ : * ? " < > | 
  const sanitizedTitle = title.replace(/[\\\/:*?"<>|]/g, '-');
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const formattedDate =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  return `${sanitizedTitle}-${formattedDate}.pdf`;
};

function ExportPanel() {
  const selectedBook = useSelector((state) =>
    state.books.find((b) => b.id === state.selectedBookId)
  );
  const chapters = selectedBook ? selectedBook.chapters : [];

  const exportPDF = async () => {
    // Create a new jsPDF instance (A4, portrait, mm units)
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidthMm = doc.internal.pageSize.getWidth();
    const pageHeightMm = doc.internal.pageSize.getHeight();
    const marginMm = 10;
    // Convert mm to pixels (1 mm ≈ 3.78 px)
    const mmToPx = (mm) => mm * 3.78;
    const contentWidthPx = mmToPx(pageWidthMm - marginMm * 2);

    // ----- TITLE PAGE -----
    const bookTitle = selectedBook ? selectedBook.title : 'Untitled';
    doc.setFontSize(24);
    doc.text(bookTitle, pageWidthMm / 2, pageHeightMm / 2, { align: 'center' });

    if (chapters.length > 0) {
      doc.addPage();
    }

    // ----- CHAPTER PAGES -----
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (i > 0) {
        doc.addPage();
      }
      doc.setFontSize(12);
      doc.text(chapter.title, pageWidthMm / 2, 20, { align: 'center' });

      const tempDiv = document.createElement('div');
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '10px'; // Enforce a 10px font size for export
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.padding = '10px';
      tempDiv.style.width = `${contentWidthPx}px`;
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.wordWrap = 'break-word';
      tempDiv.style.whiteSpace = 'pre-wrap';

      tempDiv.innerHTML =
        chapter.content && typeof chapter.content === 'object'
          ? rawToHtml(chapter.content)
          : '(No content)';

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = pageWidthMm - marginMm * 2;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, 'PNG', marginMm, 30, pdfWidth, pdfHeight);
      document.body.removeChild(tempDiv);
    }
    // Generate filename using the book title and current date/time.
    const filename = generateFilename(bookTitle);
    doc.save(filename);
  };

  return (
    <ExportContainer>
      <button onClick={exportPDF}>Export as PDF</button>
      <button onClick={() => alert('Export as ePub coming soon!')}>Export as ePub</button>
    </ExportContainer>
  );
}

export default ExportPanel;
