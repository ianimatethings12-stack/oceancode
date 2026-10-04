import chalk from 'chalk';
import boxen from 'boxen';
import { state, updateGitBranch } from '../config.js';
import { renderBanner } from '../ui/banner.js';
import { oceanGrad, bioGrad, coralGrad } from '../ui/colors.js';
import fs from 'fs';
import path from 'path';

export const commands = {
  '/help': {
    desc: 'Show available commands and keyboard shortcuts',
    run: () => {
      const helpTable = [
        `${chalk.bold.hex('#00f2fe')('COMMANDS')}`,
        `  ${chalk.bold.hex('#38ef7d')('/help')}       ${chalk.dim('―')} ${chalk.white('Display this help palette')}`,
        `  ${chalk.bold.hex('#38ef7d')('/clear')}      ${chalk.dim('―')} ${chalk.white('Clear screen and reset session view')}`,
        `  ${chalk.bold.hex('#38ef7d')('/model')}      ${chalk.dim('―')} ${chalk.white('Switch active AI model (Ocean 3.5, Claude 3.7, etc.)')}`,
        `  ${chalk.bold.hex('#38ef7d')('/status')}     ${chalk.dim('―')} ${chalk.white('Show workspace, git, and token metrics')}`,
        `  ${chalk.bold.hex('#38ef7d')('/compact')}    ${chalk.dim('―')} ${chalk.white('Compress context window tokens')}`,
        `  ${chalk.bold.hex('#38ef7d')('/theme')}      ${chalk.dim('―')} ${chalk.white('Switch color theme (ocean, bioluminescence, coral)')}`,
        `  ${chalk.bold.hex('#38ef7d')('/exit')}       ${chalk.dim('―')} ${chalk.white('Safely exit Ocean Code')}`,
        '',
        `${chalk.bold.hex('#00f2fe')('SHORTCUTS & TIPS')}`,
        `  ${chalk.bold.hex('#ffd166')('Enter')}       ${chalk.dim('―')} ${chalk.white('Submit message')}`,
        `  ${chalk.bold.hex('#ffd166')('\\ + Enter')}   ${chalk.dim('―')} ${chalk.white('Multi-line input mode')}`,
        `  ${chalk.bold.hex('#ffd166')('↑ / ↓')}       ${chalk.dim('―')} ${chalk.white('Cycle through prompt history')}`,
        `  ${chalk.bold.hex('#ffd166')('Ctrl + C')}    ${chalk.dim('―')} ${chalk.white('Cancel current prompt or exit')}`,
      ].join('\n');

      console.log(
        boxen(helpTable, {
          title: chalk.bold.hex('#00f2fe')(' 🌊 OCEAN CODE COMMAND PALETTE '),
          borderColor: '#00a8cc',
          borderStyle: 'round',
          padding: { top: 0, bottom: 0, left: 2, right: 2 },
          margin: { top: 1, bottom: 1, left: 1, right: 1 },
        })
      );
    },
  },

  '/clear': {
    desc: 'Clear terminal screen and show fresh banner',
    run: () => {
      console.clear();
      renderBanner();
    },
  },

  '/status': {
    desc: 'Show detailed environment and session status',
    run: () => {
      updateGitBranch();
      let fileCount = 0;
      try {
        const files = fs.readdirSync(state.cwd);
        fileCount = files.length;
      } catch {}

      const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

      const statusInfo = [
        `${chalk.hex('#00f2fe')('🌊 Workspace     :')} ${chalk.bold.white(state.cwd)}`,
        `${chalk.hex('#00f2fe')('📁 Files in CWD  :')} ${chalk.white(fileCount + ' items')}`,
        `${chalk.hex('#00f2fe')('🌿 Git Branch    :')} ${state.gitBranch !== 'none' ? chalk.hex('#38ef7d')(state.gitBranch) : chalk.dim('No repository')}`,
        `${chalk.hex('#00f2fe')('🧠 Active Model  :')} ${chalk.bold.hex('#38ef7d')(state.model)}`,
        `${chalk.hex('#00f2fe')('📊 Context Tokens:')} ${chalk.white(state.tokensUsed)} / ${chalk.dim((state.contextLimit / 1000) + 'k tokens')}`,
        `${chalk.hex('#00f2fe')('💻 Node.js Engine:')} ${chalk.white(process.version)} (Platform: ${process.platform})`,
        `${chalk.hex('#00f2fe')('⚡ Heap Memory   :')} ${chalk.white(mem + ' MB')}`,
      ].join('\n');

      console.log(
        boxen(statusInfo, {
          title: chalk.bold.hex('#00f2fe')(' 📊 OCEAN ENVIRONMENT STATUS '),
          borderColor: '#1e3a5f',
          borderStyle: 'round',
          padding: { top: 0, bottom: 0, left: 2, right: 2 },
          margin: { top: 1, bottom: 1, left: 1, right: 1 },
        })
      );
    },
  },

  '/model': {
    desc: 'Switch active AI model',
    run: (arg) => {
      if (arg) {
        const match = state.availableModels.find(m => m.id.toLowerCase().includes(arg.toLowerCase()));
        if (match) {
          state.model = match.id;
          console.log(`\n  ${chalk.hex('#38ef7d')('✓')} Switched active model to: ${chalk.bold.hex('#00f2fe')(match.name)}\n`);
          return;
        }
      }

      // Cycle or show list
      console.log('\n' + chalk.bold.hex('#00f2fe')('  Available Ocean Code Models:'));
      state.availableModels.forEach((m, idx) => {
        const active = m.id === state.model;
        const pointer = active ? chalk.bold.hex('#38ef7d')('  ● ') : chalk.dim('  ○ ');
        const name = active ? chalk.bold.white(m.name) : chalk.hex('#8892b0')(m.name);
        console.log(`${pointer} [${idx + 1}] ${name} ${chalk.dim('(' + m.speed + ' - ' + m.desc + ')')}`);
      });
      console.log(chalk.dim('\n  Usage: /model <name>  (e.g., /model sonnet or /model abyss)\n'));
    },
  },

  '/compact': {
    desc: 'Compact token context window',
    run: () => {
      const prev = state.tokensUsed;
      state.tokensUsed = Math.max(0, Math.floor(prev * 0.3));
      console.log(`\n  ${chalk.hex('#38ef7d')('✓')} Context compressed: ${chalk.dim(prev + ' tokens')} → ${chalk.bold.hex('#00f2fe')(state.tokensUsed + ' tokens')}\n`);
    },
  },

  '/theme': {
    desc: 'Change CLI color theme',
    run: (arg) => {
      const themes = ['ocean', 'bioluminescence', 'coralReef'];
      if (arg && themes.includes(arg)) {
        state.theme = arg;
        console.log(`\n  ${chalk.hex('#38ef7d')('✓')} Switched theme to: ${chalk.bold.hex('#00f2fe')(arg)}\n`);
      } else {
        console.log(`\n  Current theme: ${chalk.bold.hex('#00f2fe')(state.theme)}`);
        console.log(`  Options: ${themes.map(t => chalk.hex('#38ef7d')(t)).join(', ')}\n`);
      }
    },
  },

  '/exit': {
    desc: 'Exit Ocean Code',
    run: () => {
      console.log('\n' + oceanGrad('  🌊 Leaving the Ocean. Farewell and smooth sailing!') + '\n');
      process.exit(0);
    },
  },
};
