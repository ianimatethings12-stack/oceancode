import figlet from 'figlet';
import chalk from 'chalk';
import { renderHr } from './colors.js';
import { state } from '../config.js';

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

  // Top session header
  const branchPart = state.gitBranch && state.gitBranch !== 'none' ? `:${state.gitBranch}` : '';
  const topMeta = `${chalk.dim(state.cwd + branchPart)}  ${chalk.dim('·')}  ${chalk.dim('v' + state.version)}  ${chalk.dim('·')}  ${chalk.dim('Interactive Session')}`;

  console.log('\n' + topMeta + '\n');
  console.log(bannerOutput.join('\n'));
  console.log(renderHr() + '\n');

  // Return the total rows printed so scrolling starts directly below the <hr>
  // '\n' + topMeta + '\n' (3 rows) + bannerOutput (totalRows) + renderHr() + '\n' (2 rows)
  return 3 + totalRows + 2;
}

export function renderMiniHeader() {
  console.log(chalk.bold.white('OCEAN CODE'));
  console.log(renderHr() + '\n');
  return 3;
}
