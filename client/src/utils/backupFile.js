const BACKUP_MAGIC = 'EZN1';
const BACKUP_VERSION = 1;
const BACKUP_XOR_KEY = 'ez-novel-backup';

const xorBytes = (bytes) => {
  const keyBytes = new TextEncoder().encode(BACKUP_XOR_KEY);
  const result = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    result[index] = bytes[index] ^ keyBytes[index % keyBytes.length];
  }
  return result;
};

export const createBookBackupBlob = (book) => {
  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    book,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const obscured = xorBytes(payloadBytes);
  const header = new TextEncoder().encode(BACKUP_MAGIC);
  return new Blob([header, obscured], { type: 'application/octet-stream' });
};

export const parseBackupFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = new TextDecoder().decode(bytes.slice(0, BACKUP_MAGIC.length));

  if (header !== BACKUP_MAGIC) {
    throw new Error('This file is not a valid EZ Novel backup.');
  }

  const payloadBytes = xorBytes(bytes.slice(BACKUP_MAGIC.length));
  const payloadText = new TextDecoder().decode(payloadBytes);
  const payload = JSON.parse(payloadText);

  if (payload?.book && typeof payload.book === 'object') {
    return payload.book;
  }

  if (payload?.data && Array.isArray(payload.data.books)) {
    const selected = payload.data.books.find((book) => book.id === payload.data.selectedBookId);
    return selected || payload.data.books[0] || null;
  }

  throw new Error('Backup file is missing required book data.');
};
