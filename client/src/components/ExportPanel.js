import React, { useState } from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useSelector } from 'react-redux';
import { rawToHtml } from '../utils/rawToHtml';
import { createBookBackupBlob } from '../utils/backupFile';

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

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 9px 12px;
  font-size: 0.86rem;
`;

const MenuWrap = styled.div`
  position: relative;
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 180px;
  padding: 8px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(9, 16, 29, 0.96);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
  z-index: 20;
`;

const MenuButton = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.84rem;
  color: #f7fbff;
  background: transparent;
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const StatusText = styled.p`
  margin: 10px 0 0;
  font-size: 0.78rem;
  color: ${({ error }) => (error ? '#fecaca' : 'var(--text-muted)')};
`;

const sanitizeTitle = (title) => (title || 'Untitled').replace(/[\\/:*?"<>|]/g, '-');

const buildTimestamp = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
};

const makeFilename = (title, ext) => `${sanitizeTitle(title)}-${buildTimestamp()}.${ext}`;

function ExportPanel({ compact = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [statusError, setStatusError] = useState(false);

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

    doc.save(makeFilename(bookTitle, 'pdf'));
    setStatus('PDF exported.');
    setStatusError(false);
  };

  const exportBackup = () => {
    const bookTitle = selectedBook ? selectedBook.title : 'ez-novel-backup';
    const blob = createBookBackupBlob(selectedBook);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = makeFilename(bookTitle, 'ezn');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus('Backup file exported.');
    setStatusError(false);
  };

  const handleExportAction = async (kind) => {
    setMenuOpen(false);
    if (kind === 'pdf') {
      await exportPDF();
      return;
    }
    if (kind === 'epub') {
      setStatus('EPUB export is still on the roadmap.');
      setStatusError(false);
      return;
    }
    if (kind === 'backup') {
      exportBackup();
    }
  };

  return (
    <ExportContainer compact={compact}>
      <Heading>Share / Backup</Heading>
      <Subtext>Export polished reading copies or save this manuscript as a round-trip backup file.</Subtext>
      <Row>
        <MenuWrap>
          <ActionButton onClick={() => setMenuOpen((open) => !open)}>Export</ActionButton>
          {menuOpen && (
            <Menu>
              <MenuButton onClick={() => handleExportAction('pdf')}>PDF</MenuButton>
              <MenuButton onClick={() => handleExportAction('epub')}>EPUB</MenuButton>
              <MenuButton onClick={() => handleExportAction('backup')}>Backup File (.ezn)</MenuButton>
            </Menu>
          )}
        </MenuWrap>
      </Row>
      {status ? <StatusText error={statusError ? 1 : 0}>{status}</StatusText> : null}
    </ExportContainer>
  );
}

export default ExportPanel;
