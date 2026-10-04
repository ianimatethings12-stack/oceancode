import readline from 'readline';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { state } from '../config.js';
import { setCursorNormal } from './cursor.js';

export class BottomBar {
  constructor(options = {}) {
    this.onSubmit = options.onSubmit || (() => {});
    this.onExit = options.onExit || (() => {});
    this.input = '';
    this.cursorPos = 0;
    this.barHeight = 5;
    this.history = [];
    this.historyIndex = -1;
    this.savedInput = '';
    this.statusMessage = null;
    this.isRawModeActive = false;
    this.isRendering = false;
    this.multilineBuffer = [];
  }

  getDimensions() {
    return {
      rows: process.stdout.rows || 24,
      cols: process.stdout.columns || 80,
    };
  }

  setupScrollingRegion() {
    const { rows } = this.getDimensions();
    const scrollBottom = Math.max(1, rows - this.barHeight);
    process.stdout.write(`\x1b[1;${scrollBottom}r`);
  }

  resetScrollingRegion() {
    process.stdout.write('\x1b[r');
  }

  start() {
    this.setupScrollingRegion();
    setCursorNormal();

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      this.isRawModeActive = true;
    }

    this.keyListener = (str, key) => this.handleKeypress(str, key);
    process.stdin.on('keypress', this.keyListener);

    this.resizeListener = () => {
      this.setupScrollingRegion();
      this.render();
    };
    process.stdout.on('resize', this.resizeListener);

    this.render();
  }

  stop() {
    this.resetScrollingRegion();
    if (this.keyListener) {
      process.stdin.removeListener('keypress', this.keyListener);
    }
    if (this.resizeListener) {
      process.stdout.removeListener('resize', this.resizeListener);
    }
    if (process.stdin.isTTY && this.isRawModeActive) {
      process.stdin.setRawMode(false);
      this.isRawModeActive = false;
    }
    const { rows } = this.getDimensions();
    process.stdout.write(`\x1b[${rows};1H\n`);
    setCursorNormal();
  }

  setStatus(msg) {
    this.statusMessage = msg;
    this.render();
  }

  clearStatus() {
    this.statusMessage = null;
    this.render();
  }

  render() {
    if (this.isRendering) return;
    this.isRendering = true;

    try {
      const { rows, cols } = this.getDimensions();
      const topRow = rows - this.barHeight + 1;
      const innerWidth = Math.max(10, cols - 2);

      // Save cursor position
      process.stdout.write('\x1b7');

      // Row 1: Top border with title
      const title = ' Input ';
      const borderFill = Math.max(0, innerWidth - title.length - 2);
      const row1 = '┌─' + chalk.dim(title) + '─'.repeat(borderFill) + '┐';
      process.stdout.write(`\x1b[${topRow};1H\x1b[2K${chalk.gray(row1)}`);

      // Row 2: Prompt and input area
      const promptPrefix = this.multilineBuffer.length > 0 ? ' ... ' : ' > ';
      let displayContent = '';

      if (this.statusMessage) {
        displayContent = chalk.dim(this.statusMessage);
      } else if (this.input) {
        displayContent = chalk.white(this.input);
      } else {
        const placeholder = this.multilineBuffer.length > 0 
          ? 'continue typing... (or press Enter when done)' 
          : 'Ask anything... (or type /help for commands)';
        displayContent = chalk.dim(placeholder);
      }

      // Truncate if exceeding available line width
      const maxInputChars = innerWidth - stripAnsi(promptPrefix).length - 1;
      let visibleInput = displayContent;
      if (stripAnsi(this.input).length > maxInputChars) {
        visibleInput = chalk.white('...' + this.input.slice(-maxInputChars + 3));
      }

      const inputLineRaw = promptPrefix + stripAnsi(visibleInput);
      const padLen = Math.max(0, innerWidth - inputLineRaw.length);
      const row2 = chalk.gray('│') + chalk.dim(promptPrefix) + visibleInput + ' '.repeat(padLen) + chalk.gray('│');
      process.stdout.write(`\x1b[${topRow + 1};1H\x1b[2K${row2}`);

      // Row 3: Middle divider
      const row3 = '├' + '─'.repeat(innerWidth) + '┤';
      process.stdout.write(`\x1b[${topRow + 2};1H\x1b[2K${chalk.gray(row3)}`);

      // Row 4: Status line with active Model Name written at the bottom
      const branchPart = state.gitBranch && state.gitBranch !== 'none' ? `:${state.gitBranch}` : '';
      const leftText = ` ${state.cwd}${branchPart} `;
      const modelText = ` Model: ${state.model} `;
      const rightText = ' /help ';

      const leftFmt = chalk.dim(leftText);
      const modelFmt = chalk.bold.white(modelText);
      const rightFmt = chalk.dim(rightText);

      const lLen = stripAnsi(leftText).length;
      const mLen = stripAnsi(modelText).length;
      const rLen = stripAnsi(rightText).length;

      const avail = innerWidth - (lLen + mLen + rLen);
      let line4Body = '';
      if (avail >= 2) {
        const pad1 = Math.floor(avail / 2);
        const pad2 = avail - pad1;
        line4Body = leftFmt + ' '.repeat(pad1) + modelFmt + ' '.repeat(pad2) + rightFmt;
      } else {
        line4Body = (leftFmt + ' ' + modelFmt).slice(0, innerWidth);
      }
      const rawBodyLen = stripAnsi(line4Body).length;
      const row4Pad = Math.max(0, innerWidth - rawBodyLen);
      const row4 = chalk.gray('│') + line4Body + ' '.repeat(row4Pad) + chalk.gray('│');
      process.stdout.write(`\x1b[${topRow + 3};1H\x1b[2K${row4}`);

      // Row 5: Bottom border
      const row5 = '└' + '─'.repeat(innerWidth) + '┘';
      process.stdout.write(`\x1b[${topRow + 4};1H\x1b[2K${chalk.gray(row5)}`);

      // Position terminal cursor right inside the input row at the typing position
      if (!this.statusMessage) {
        const cursorCol = 1 + stripAnsi(promptPrefix).length + Math.min(this.cursorPos, maxInputChars) + 1;
        process.stdout.write(`\x1b[${topRow + 1};${cursorCol}H`);
      } else {
        process.stdout.write('\x1b8');
      }
    } finally {
      this.isRendering = false;
    }
  }

  writeToScroll(text) {
    const { rows } = this.getDimensions();
    const scrollBottom = Math.max(1, rows - this.barHeight);

    const lines = text.split('\n');
    for (const line of lines) {
      process.stdout.write(`\x1b[${scrollBottom};1H\n${line}`);
    }
    this.render();
  }

  async streamLines(lines, delayMs = 15) {
    const { rows } = this.getDimensions();
    const scrollBottom = Math.max(1, rows - this.barHeight);

    for (const line of lines) {
      process.stdout.write(`\x1b[${scrollBottom};1H\n${line}`);
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    process.stdout.write(`\x1b[${scrollBottom};1H\n`);
    this.render();
  }

  handleKeypress(str, key) {
    if (!key) return;

    // Ctrl+C or Ctrl+D: Exit or cancel
    if ((key.ctrl && key.name === 'c') || (key.ctrl && key.name === 'd')) {
      if (this.input.length > 0) {
        this.input = '';
        this.cursorPos = 0;
        this.multilineBuffer = [];
        this.render();
        return;
      }
      this.stop();
      this.onExit();
      return;
    }

    // Enter: Submit prompt
    if (key.name === 'return') {
      const raw = this.input.trimEnd();

      // Multi-line continuation: ending with backslash '\'
      if (raw.endsWith('\\')) {
        this.multilineBuffer.push(raw.slice(0, -1));
        this.input = '';
        this.cursorPos = 0;
        this.render();
        return;
      }

      if (this.multilineBuffer.length > 0) {
        this.multilineBuffer.push(raw);
        const fullInput = this.multilineBuffer.join('\n').trim();
        this.multilineBuffer = [];
        this.input = '';
        this.cursorPos = 0;
        this.render();
        if (fullInput) {
          this.history.push(fullInput);
          this.historyIndex = -1;
          this.onSubmit(fullInput);
        }
        return;
      }

      const input = raw.trim();
      this.input = '';
      this.cursorPos = 0;
      this.render();

      if (input) {
        this.history.push(input);
        this.historyIndex = -1;
        this.onSubmit(input);
      }
      return;
    }

    // Backspace
    if (key.name === 'backspace') {
      if (this.cursorPos > 0) {
        this.input = this.input.slice(0, this.cursorPos - 1) + this.input.slice(this.cursorPos);
        this.cursorPos--;
        this.render();
      }
      return;
    }

    // Delete
    if (key.name === 'delete') {
      if (this.cursorPos < this.input.length) {
        this.input = this.input.slice(0, this.cursorPos) + this.input.slice(this.cursorPos + 1);
        this.render();
      }
      return;
    }

    // Arrow Left
    if (key.name === 'left') {
      if (this.cursorPos > 0) {
        this.cursorPos--;
        this.render();
      }
      return;
    }

    // Arrow Right
    if (key.name === 'right') {
      if (this.cursorPos < this.input.length) {
        this.cursorPos++;
        this.render();
      }
      return;
    }

    // Home / Ctrl+A
    if (key.name === 'home' || (key.ctrl && key.name === 'a')) {
      this.cursorPos = 0;
      this.render();
      return;
    }

    // End / Ctrl+E
    if (key.name === 'end' || (key.ctrl && key.name === 'e')) {
      this.cursorPos = this.input.length;
      this.render();
      return;
    }

    // Clear line: Ctrl+U
    if (key.ctrl && key.name === 'u') {
      this.input = '';
      this.cursorPos = 0;
      this.render();
      return;
    }

    // Up Arrow (History back)
    if (key.name === 'up') {
      if (this.history.length === 0) return;
      if (this.historyIndex === -1) {
        this.savedInput = this.input;
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
      this.input = this.history[this.historyIndex];
      this.cursorPos = this.input.length;
      this.render();
      return;
    }

    // Down Arrow (History forward)
    if (key.name === 'down') {
      if (this.historyIndex === -1) return;
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input = this.history[this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.input = this.savedInput;
      }
      this.cursorPos = this.input.length;
      this.render();
      return;
    }

    // Normal characters / paste
    if (str && !key.ctrl && !key.meta) {
      this.input = this.input.slice(0, this.cursorPos) + str + this.input.slice(this.cursorPos);
      this.cursorPos += str.length;
      this.render();
    }
  }
}
