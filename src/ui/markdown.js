import chalk from 'chalk';
import boxen from 'boxen';
import highlight from 'cli-highlight';

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
        
        const thinkContent = thinkBuffer.join('\n');
        formatted.push(chalk.dim('Thinking: ' + thinkContent.trim()));
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

        const codeLines = highlighted.split('\n');
        const padLen = String(codeLines.length).length;
        
        const numberedCode = codeLines
          .map((cLine, idx) => `${chalk.dim(String(idx + 1).padStart(padLen) + ' │')} ${cLine}`)
          .join('\n');

        const codeBox = boxen(numberedCode, {
          title: lang ? chalk.dim(` ${lang} `) : undefined,
          titleAlignment: 'right',
          borderColor: 'gray',
          borderStyle: 'round',
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

    // Headers
    if (line.startsWith('### ')) {
      formatted.push('\n' + chalk.bold(line.slice(4)));
      continue;
    }
    if (line.startsWith('## ')) {
      formatted.push('\n' + chalk.bold(line.slice(3)));
      continue;
    }
    if (line.startsWith('# ')) {
      formatted.push('\n' + chalk.bold(line.slice(2)));
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      formatted.push(`  ${chalk.dim('│')} ${chalk.dim(line.slice(2))}`);
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const indent = line.search(/\S/);
      const bulletContent = line.trim().slice(2);
      formatted.push(`${' '.repeat(indent)}- ${formatInline(bulletContent)}`);
      continue;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const indent = line.search(/\S/);
      formatted.push(`${' '.repeat(indent)}${numMatch[1]}. ${formatInline(numMatch[2])}`);
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
    return chalk.dim('`' + code + '`');
  });

  // Bold **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
    return chalk.bold(content);
  });

  // Italic *text*
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_, content) => {
    return chalk.italic(content);
  });

  return result;
}

export function renderToolCall(toolName, target, status = 'success') {
  const statusMark = status === 'success' ? chalk.dim('✓') : chalk.dim('✗');
  console.log(`[${toolName}] ${target} ${statusMark}`);
}
