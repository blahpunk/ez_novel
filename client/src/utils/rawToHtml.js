import draftToHtml from 'draftjs-to-html';

export function rawToHtml(raw) {
  if (!raw || !raw.blocks) return '';
  return draftToHtml(raw);
}
