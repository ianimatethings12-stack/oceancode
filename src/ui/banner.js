import chalk from 'chalk';
import { renderHr } from './colors.js';

export function renderBanner() {
  console.log('\n' + chalk.bold('OCEAN CODE'));
  console.log(renderHr() + '\n');
}

export function renderMiniHeader() {
  console.log(chalk.bold('OCEAN CODE'));
  console.log(renderHr() + '\n');
}
