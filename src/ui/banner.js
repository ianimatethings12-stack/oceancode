import figlet from 'figlet';
import boxen from 'boxen';
import chalk from 'chalk';
import { oceanGrad, bioGrad, aquaGrad, colors } from './colors.js';
import { state } from '../config.js';

export function renderBanner() {
  const asciiTitle = figlet.textSync('OCEAN CODE', {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
  });

  const gradientTitle = oceanGrad(asciiTitle);

  const subtitle = `${chalk.bold.hex('#00f2fe')('🌊  O C E A N   C O D E')}  ${chalk.dim('│')}  ${chalk.hex('#8892b0')('Autonomous Agentic Coding Companion')}  ${chalk.dim('│')}  ${chalk.hex('#38ef7d')('v' + state.version)}`;

  // Status metrics
  const cwdDisplay = state.cwd.length > 45 ? '...' + state.cwd.slice(-42) : state.cwd;
  const branchDisplay = state.gitBranch !== 'none' 
    ? chalk.hex('#38ef7d')(`🌿 ${state.gitBranch}`) 
    : chalk.hex('#708090')('⚪ (no git repo)');

  const statusCardContent = [
    `${chalk.hex('#00f2fe')('📂 Directory')}  ${chalk.dim('›')}  ${chalk.bold.white(cwdDisplay)}    ${branchDisplay}`,
    `${chalk.hex('#00f2fe')('🧠 Model    ')}  ${chalk.dim('›')}  ${chalk.bold.hex('#38ef7d')(state.model)}    ${chalk.hex('#4facfe')('⚡ Mode: ' + state.mode)}`,
    `${chalk.hex('#00f2fe')('📊 Context  ')}  ${chalk.dim('›')}  ${chalk.hex('#8892b0')(`${state.tokensUsed.toLocaleString()} / ${(state.contextLimit / 1000)}k tokens (0%)`)}    ${chalk.hex('#ffd166')('● Ready')}`,
  ].join('\n');

  const statusCard = boxen(statusCardContent, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 0, bottom: 0, left: 1, right: 1 },
    borderColor: '#00a8cc',
    borderStyle: 'round',
    dimBorder: true,
  });

  const tipsBar = `  ${chalk.dim('Commands:')} ${chalk.hex('#00f2fe')('/help')} ${chalk.dim('•')} ${chalk.hex('#00f2fe')('/clear')} ${chalk.dim('•')} ${chalk.hex('#00f2fe')('/model')} ${chalk.dim('•')} ${chalk.hex('#00f2fe')('/status')} ${chalk.dim('•')} ${chalk.hex('#ff6b6b')('/exit')}  ${chalk.dim('│  Type your prompt or question below')}`;

  console.log('\n' + gradientTitle);
  console.log('  ' + subtitle + '\n');
  console.log(statusCard);
  console.log(tipsBar + '\n');
}

export function renderMiniHeader() {
  const mini = `${chalk.bold.hex('#00f2fe')('🌊 OCEAN CODE')} ${chalk.dim('v' + state.version)} ${chalk.dim('•')} ${chalk.hex('#38ef7d')(state.model)} ${chalk.dim('•')} ${chalk.hex('#8892b0')(state.gitBranch)}`;
  console.log(mini + '\n');
}
