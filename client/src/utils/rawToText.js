export function rawToText(raw) {
  if (!raw || !raw.blocks) return '';
  return raw.blocks.map(block => block.text).join('\n');
}
