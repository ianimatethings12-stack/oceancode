import chalk from 'chalk';
import boxen from 'boxen';
import highlight from 'cli-highlight';
import { colors, oceanGrad } from './colors.js';

export function formatMarkdown(text) {
  if (!text) return '';

  let lines = text.split('\n');
  let formatted = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';
  let inThinkBlock = false;
  let thinkBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Thinking block handling (<think> ... </think>)
    if (line.includes('<think>')) {
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
        
        // Render thinking block
        const thinkContent = thinkBuffer.join('\n');
        formatted.push(
          boxen(chalk.italic.hex('#8892b0')(thinkContent), {
            title: chalk.bold.hex('#4facfe')('✦ Deep Thinking'),
            titleAlignment: 'left',
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            borderColor: '#233554',
            borderStyle: 'round',
            dimBorder: true,
          })
        );
        continue;
      } else {
        thinkBuffer.push(line);
        continue;
      }
    }

    // Code block delimiters
    if (line.trim().startsWith('```')) {
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

        // Add line numbers
        const codeLines = highlighted.split('\n');
        const totalLines = codeLines.length;
        const padLen = String(totalLines).length;
        
        const numberedCode = codeLines
          .map((cLine, idx) => `${chalk.dim(String(idx + 1).padStart(padLen) + ' │')} ${cLine}`)
          .join('\n');

        const codeBox = boxen(numberedCode, {
          title: chalk.bold.hex('#00f2fe')(` ${lang.toUpperCase()} `),
          titleAlignment: 'right',
          borderColor: '#1e3a5f',
          borderStyle: 'round',
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

    // Headers
    if (line.startsWith('### ')) {
      formatted.push('\n' + chalk.bold.hex('#00f2fe')('◆ ' + line.slice(4)) + '\n');
      continue;
    }
    if (line.startsWith('## ')) {
      formatted.push('\n' + chalk.bold.hex('#4facfe')('◼ ' + line.slice(3)));
      formatted.push(chalk.hex('#1e3a5f')('─'.repeat(Math.min(line.length + 4, 60))) + '\n');
      continue;
    }
    if (line.startsWith('# ')) {
      formatted.push('\n' + oceanGrad('■ ' + line.slice(2).toUpperCase()));
      formatted.push(chalk.hex('#00a8cc')('━'.repeat(Math.min(line.length + 4, 60))) + '\n');
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      formatted.push(`  ${chalk.hex('#00f2fe')('│')} ${chalk.italic.hex('#a0aec0')(line.slice(2))}`);
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const indent = line.search(/\S/);
      const bulletContent = line.trim().slice(2);
      formatted.push(`${' '.repeat(indent)}  ${chalk.hex('#00f2fe')('•')} ${formatInline(bulletContent)}`);
      continue;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const indent = line.search(/\S/);
      formatted.push(`${' '.repeat(indent)}  ${chalk.hex('#38ef7d')(numMatch[1] + '.')} ${formatInline(numMatch[2])}`);
      continue;
    }

    // Regular line
    formatted.push(formatInline(line));
  }

  return formatted.join('\n');
}

export function formatInline(text) {
  if (!text) return '';

  // Inline code `code`
  let result = text.replace(/`([^`]+)`/g, (_, code) => {
    return chalk.bgHex('#0f2537').hex('#00f2fe')(` ${code} `);
  });

  // Bold **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
    return chalk.bold.white(content);
  });

  // Italic *text* or _text_
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_, content) => {
    return chalk.italic(content);
  });

  return result;
}

export function renderToolCall(toolName, target, status = 'success') {
  const icon = {
    read: '📁 Read',
    write: '✍️ Write',
    exec: '⚡ Exec',
    search: '🔍 Search',
    git: '🌿 Git',
  }[toolName] || '⚙️ Tool';

  const statusColor = status === 'success' ? chalk.hex('#38ef7d')('✓') : chalk.hex('#ff6b6b')('✗');
  console.log(`  ${chalk.bgHex('#0a2540').hex('#00f2fe')(` ${icon} `)} ${chalk.white(target)} ${statusColor}`);
}
