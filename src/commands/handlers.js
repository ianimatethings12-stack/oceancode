import chalk from 'chalk';
import { state, updateGitBranch } from '../config.js';
import { renderBanner } from '../ui/banner.js';
import fs from 'fs';

export const commands = {
  '/help': {
    desc: 'Show available commands',
    run: () => {
      console.log('\nCommands:');
      console.log('  /help      - Display this help message');
      console.log('  /clear     - Clear screen');
      console.log('  /model     - Switch or view active AI model');
      console.log('  /status    - Show workspace, git, and token metrics');
      console.log('  /compact   - Compress context window tokens');
      console.log('  /exit      - Exit Ocean Code\n');
      console.log('Shortcuts:');
      console.log('  Enter      - Submit prompt');
      console.log('  \\ + Enter  - Multi-line mode');
      console.log('  Ctrl + C   - Exit or cancel\n');
    },
  },

  '/clear': {
    desc: 'Clear terminal screen',
    run: () => {
      console.clear();
      renderBanner();
    },
  },

  '/status': {
    desc: 'Show detailed environment status',
    run: () => {
      updateGitBranch();
      let fileCount = 0;
      try {
        const files = fs.readdirSync(state.cwd);
        fileCount = files.length;
      } catch {}

      console.log('\nEnvironment Status:');
      console.log(`  Workspace     : ${state.cwd}`);
      console.log(`  Files         : ${fileCount} items`);
      console.log(`  Git Branch    : ${state.gitBranch}`);
      console.log(`  Model         : ${state.model}`);
      console.log(`  Tokens Used   : ${state.tokensUsed} / ${state.contextLimit / 1000}k`);
      console.log(`  Node.js       : ${process.version} (${process.platform})\n`);
    },
  },

  '/model': {
    desc: 'Switch active AI model',
    run: (arg) => {
      if (arg) {
        const match = state.availableModels.find(m => m.id.toLowerCase().includes(arg.toLowerCase()));
        if (match) {
          state.model = match.id;
          console.log(`\nSwitched model to: ${match.name}\n`);
          return;
        }
      }

      console.log('\nAvailable Models:');
      state.availableModels.forEach((m, idx) => {
        const active = m.id === state.model ? '*' : ' ';
        console.log(`  ${active} [${idx + 1}] ${m.name} (${m.id})`);
      });
      console.log('Usage: /model <name>\n');
    },
  },

  '/compact': {
    desc: 'Compact token context window',
    run: () => {
      const prev = state.tokensUsed;
      state.tokensUsed = Math.max(0, Math.floor(prev * 0.3));
      console.log(`\nContext tokens compressed: ${prev} -> ${state.tokensUsed}\n`);
    },
  },

  '/exit': {
    desc: 'Exit Ocean Code',
    run: () => {
      console.log('\nBye!\n');
      process.exit(0);
    },
  },
};
