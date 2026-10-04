import Table from 'cli-table3';
import chalk from 'chalk';
import { formatInline } from './markdown.js';

export function parseMarkdownTable(tableLines) {
  if (!tableLines || tableLines.length < 2) return null;

  // Filter out empty lines
  const rawRows = tableLines.map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
  if (rawRows.length < 2) return null;

  // Header row
  const headerCells = rawRows[0]
    .slice(1, -1)
    .split('|')
    .map(c => c.trim());

  // Check if second row is separator (|---|---|)
  const sepRow = rawRows[1].slice(1, -1).split('|').map(c => c.trim());
  const isSeparator = sepRow.every(c => /^:?-+:?$/.test(c));
  if (!isSeparator) return null;

  // Determine alignments
  const colAligns = sepRow.map(c => {
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });

  const table = new Table({
    head: headerCells.map(h => chalk.bold(formatInline(h))),
    colAligns: colAligns,
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│'
    },
    style: {
      head: [],
      border: ['gray'],
    },
  });

  // Data rows
  for (let i = 2; i < rawRows.length; i++) {
    const cells = rawRows[i]
      .slice(1, -1)
      .split('|')
      .map(c => formatInline(c.trim()));
    
    // Pad or trim cells to match header length
    while (cells.length < headerCells.length) cells.push('');
    table.push(cells.slice(0, headerCells.length));
  }

  return table.toString();
}
