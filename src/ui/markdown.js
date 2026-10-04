import chalk from 'chalk';
import boxen from 'boxen';
import highlight from 'cli-highlight';
import { formatLatexInMarkdown, renderLatexMath } from './latex.js';
import { parseMarkdownTable } from './table.js';

export function formatMarkdown(text) {
  if (!text) return '';

  let lines = text.split('\n');
  let formatted = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';
  let inThinkBlock = false;
  let thinkBuffer = [];
  let inTableBlock = false;
  let tableBuffer = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      const renderedTable = parseMarkdownTable(tableBuffer);
      if (renderedTable) {
        formatted.push('\n' + renderedTable + '\n');
      } else {
        // Fallback if not valid table
        tableBuffer.forEach(l => formatted.push(formatInline(l)));
      }
      tableBuffer = [];
      inTableBlock = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Thinking block handling (<think> ... </think>)
    if (line.includes('<think>')) {
      flushTable();
      inThinkBlock = true;
      thinkBuffer = [];
      const after = line.replace('<think>', '').trim();
      if (after) thinkBuffer.push(after);
      continue;
    }
    if (inThinkBlock) {
      if (line.includes('</think>')) {
        inThinkBlock = false;
        const before = line.replace('</think>', '').trim();
        if (before) thinkBuffer.push(before);
        
        const thinkContent = thinkBuffer.join('\n');
        const durSeconds = Math.max(2, Math.min(16, Math.round(thinkContent.length / 40)));
        formatted.push(`${chalk.bold('* Thought for')} ${chalk.white(durSeconds + 's')}\n`);
        continue;
      } else {
        thinkBuffer.push(line);
        continue;
      }
    }

    // Code block delimiters
    if (line.trim().startsWith('```')) {
      flushTable();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
        continue;
      } else {
        inCodeBlock = false;
        const rawCode = codeBuffer.join('\n');
        const lang = codeLang || 'text';
        
        let highlighted = rawCode;
        try {
          if (highlight.supportsLanguage(lang)) {
            highlighted = highlight.highlight(rawCode, { language: lang });
          } else {
            highlighted = highlight.highlight(rawCode, { ignoreIllegals: true });
          }
        } catch {
          highlighted = rawCode;
        }

        const codeLines = highlighted.split('\n');
        const padLen = String(codeLines.length).length;
        
        const numberedCode = codeLines
          .map((cLine, idx) => `${chalk.dim(String(idx + 1).padStart(padLen) + ' │')} ${cLine}`)
          .join('\n');

        const codeBox = boxen(numberedCode, {
          title: lang ? chalk.dim(` ${lang} `) : undefined,
          titleAlignment: 'right',
          borderColor: 'gray',
          borderStyle: 'single', // sharp rectangular code box
          dimBorder: true,
          padding: { top: 0, bottom: 0, left: 1, right: 1 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        formatted.push(codeBox);
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table detection: line starting and ending with |
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      inTableBlock = true;
      tableBuffer.push(line);
      continue;
    } else if (inTableBlock) {
      flushTable();
    }

    // Headers
    if (line.startsWith('### ')) {
      formatted.push('\n' + chalk.bold.white('▸ ' + formatInline(line.slice(4))));
      continue;
    }
    if (line.startsWith('## ')) {
      formatted.push('\n' + chalk.bold.white('◆ ' + formatInline(line.slice(3))));
      continue;
    }
    if (line.startsWith('# ')) {
      formatted.push('\n' + chalk.bold.white('◈ ' + formatInline(line.slice(2))));
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      formatted.push(`  ${chalk.gray('│')} ${chalk.italic.white(formatInline(line.slice(2)))}`);
      continue;
    }

    // Checkboxes / Task lists
    const taskMatch = line.match(/^(\s*)[*-]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      const indent = taskMatch[1].length;
      const isDone = taskMatch[2].toLowerCase() === 'x';
      const checkMark = isDone ? chalk.bold.white('☑') : chalk.dim('☐');
      formatted.push(`${' '.repeat(indent)}  ${checkMark} ${formatInline(taskMatch[3])}`);
      continue;
    }

    // Bullet points with ACTUAL DOTS (•, ◦, ▪)
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const indent = line.search(/\S/);
      const bulletContent = line.trim().slice(2);
      
      // Select dot style according to nesting level
      let dot = '•';
      if (indent >= 4) {
        dot = '▪';
      } else if (indent >= 2) {
        dot = '◦';
      }

      formatted.push(`${' '.repeat(indent)}  ${chalk.bold.white(dot)} ${formatInline(bulletContent)}`);
      continue;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const indent = line.search(/\S/);
      formatted.push(`${' '.repeat(indent)}  ${chalk.dim(numMatch[1] + '.')} ${formatInline(numMatch[2])}`);
      continue;
    }

    // Block LaTeX math: $$ ... $$ or \[ ... \]
    if (trimmed.startsWith('$$') || trimmed.startsWith('\\[')) {
      formatted.push(formatLatexInMarkdown(line));
      continue;
    }

    // Regular line with inline markdown & LaTeX
    formatted.push(formatInline(line));
  }

  flushTable();

  return formatted.join('\n');
}

export function formatInline(text) {
  if (!text) return '';

  // 1. Extract inline code `code` first to protect code content from formatting
  const codeBlocks = [];
  let result = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(chalk.dim('`') + chalk.bold.white(code) + chalk.dim('`'));
    return `\uFFF0CODE${idx}\uFFF1`;
  });

  // 2. Process LaTeX math: $...$
  const mathBlocks = [];
  result = result.replace(/(?<!\$)\$([^$\n]+)\$(?!\$)/g, (_, math) => {
    const idx = mathBlocks.length;
    const rendered = renderLatexMath(math);
    mathBlocks.push(chalk.bold(rendered));
    return `\uFFF0MATH${idx}\uFFF1`;
  });

  // 3. Bold + Italic ***text*** or ___text___
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, (_, content) => chalk.bold.italic(content));
  result = result.replace(/___([^_]+)___/g, (_, content) => chalk.bold.italic(content));

  // 4. Bold **text** or __text__ (e.g. **etc**)
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => chalk.bold(content));
  result = result.replace(/__([^_]+)__/g, (_, content) => chalk.bold(content));

  // 5. Italic *text* or _text_
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_, content) => chalk.italic(content));
  result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, (_, content) => chalk.italic(content));

  // 6. Strikethrough ~~text~~
  result = result.replace(/~~([^~]+)~~/g, (_, content) => chalk.strikethrough(content));

  // 7. Restore protected tokens
  result = result.replace(/\uFFF0MATH(\d+)\uFFF1/g, (_, idx) => mathBlocks[parseInt(idx, 10)] ?? '');
  result = result.replace(/\uFFF0CODE(\d+)\uFFF1/g, (_, idx) => codeBlocks[parseInt(idx, 10)] ?? '');

  return result;
}

export function renderToolCall(toolName, target, status = 'success') {
  const statusMark = status === 'success' ? chalk.dim('✓') : chalk.dim('✗');
  console.log(`[${toolName}] ${target} ${statusMark}`);
}
