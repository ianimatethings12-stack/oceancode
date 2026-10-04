import figlet from 'figlet';
import chalk from 'chalk';
import { renderHr } from './colors.js';

// Geometric sacred/cybernetic emblem extracted from user logo
const logoLines = [
  '     ╭──◇──╮     ',
  '   ╭╱  ┌─┐  ╲╮   ',
  ' ╭╱ ─ ╭╯ ╰╮ ─ ╲╮ ',
  '(│───│  ○  │───│)',
  ' ╰╲ ─ ╰╮ ╭╯ ─ ╱╯ ',
  '   ╰╲  └─┘  ╱╯   ',
  '     ╰──◇──╯     ',
];

export function renderBanner() {
  const cols = process.stdout.columns || 110;
  // If terminal width is tight, use Slant font (61 cols wide) else ANSI Shadow (80 cols wide)
  const font = cols >= 105 ? 'ANSI Shadow' : 'Slant';
  
  const rawTitle = figlet.textSync('OCEAN CODE', {
    font: font,
    horizontalLayout: 'fitted',
  });

  const titleLines = rawTitle.split('\n').filter(l => l.trim().length > 0);
  const totalRows = Math.max(titleLines.length, logoLines.length);

  const bannerOutput = [];
  const padWidth = titleLines[0] ? titleLines[0].length : 60;

  for (let i = 0; i < totalRows; i++) {
    const textPart = i < titleLines.length ? titleLines[i] : ' '.repeat(padWidth);
    const logoPart = i < logoLines.length ? logoLines[i] : '';
    bannerOutput.push(chalk.bold.white(textPart) + '   ' + chalk.dim.gray(logoPart));
  }

  console.log('\n' + bannerOutput.join('\n'));
  console.log(renderHr() + '\n');
}

export function renderMiniHeader() {
  console.log(chalk.bold.white('OCEAN CODE'));
  console.log(renderHr() + '\n');
}
