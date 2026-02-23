import React from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useSelector } from 'react-redux';
import { rawToHtml } from '../utils/rawToHtml';

const ExportContainer = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 10, 20, 0.68);
  box-shadow: var(--shadow-soft);
  padding: ${({ compact }) => (compact ? '12px' : '16px')};
`;

const Heading = styled.h4`
  margin: 0 0 4px;
  color: #f7fbff;
  font-family: var(--font-display);
`;

const Subtext = styled.p`
  margin: 0 0 12px;
  font-size: 0.84rem;
  color: var(--text-muted);
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 9px 12px;
  font-size: 0.86rem;
`;

const SecondaryButton = styled(ActionButton)`
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.16);
`;

const generateFilename = (title) => {
  const sanitizedTitle = title.replace(/[\\/:*?"<>|]/g, '-');
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

function ExportPanel({ compact = false }) {
  const selectedBook = useSelector((state) => state.books.find((book) => book.id === state.selectedBookId));
  const chapters = selectedBook ? selectedBook.chapters : [];

  const exportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidthMm = doc.internal.pageSize.getWidth();
    const pageHeightMm = doc.internal.pageSize.getHeight();
    const marginMm = 10;
    const mmToPx = (mm) => mm * 3.78;
    const contentWidthPx = mmToPx(pageWidthMm - marginMm * 2);

    const bookTitle = selectedBook ? selectedBook.title : 'Untitled';
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text(bookTitle, pageWidthMm / 2, pageHeightMm / 2, { align: 'center' });

    if (chapters.length > 0) {
      doc.addPage();
    }

    for (let i = 0; i < chapters.length; i += 1) {
      const chapter = chapters[i];
      if (i > 0) {
        doc.addPage();
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(chapter.title, pageWidthMm / 2, 20, { align: 'center' });

      const tempDiv = document.createElement('div');
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';
      tempDiv.style.fontFamily = 'Georgia, serif';
      tempDiv.style.fontSize = '11px';
      tempDiv.style.lineHeight = '1.45';
      tempDiv.style.padding = '10px';
      tempDiv.style.width = `${contentWidthPx}px`;
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.wordWrap = 'break-word';
      tempDiv.style.whiteSpace = 'pre-wrap';

      const exportStyles = `
        <style>
          .pdf-export-content, .pdf-export-content * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
            text-shadow: none !important;
          }
          .pdf-export-content a {
            color: #000000 !important;
            text-decoration: underline;
          }
        </style>
      `;
      const chapterHtml =
        chapter.content && typeof chapter.content === 'object' ? rawToHtml(chapter.content) : '(No content)';
      tempDiv.innerHTML = `${exportStyles}<div class="pdf-export-content">${chapterHtml}</div>`;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = pageWidthMm - marginMm * 2;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, 'PNG', marginMm, 30, pdfWidth, pdfHeight);
      document.body.removeChild(tempDiv);
    }

    const filename = generateFilename(bookTitle);
    doc.save(filename);
  };

  return (
    <ExportContainer compact={compact}>
      <Heading>Export manuscript</Heading>
      <Subtext>Keep your latest draft ready for sharing, printing, or long-form review.</Subtext>
      <Actions>
        <ActionButton onClick={exportPDF}>Export PDF</ActionButton>
        <SecondaryButton onClick={() => alert('Export as ePub is on the roadmap.')}>Export ePub</SecondaryButton>
      </Actions>
    </ExportContainer>
  );
}

export default ExportPanel;
