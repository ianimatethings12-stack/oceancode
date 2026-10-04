import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

function highlightTokens(code) {
  return code
    .replace(/\b(import|from|const|async|await|return|function|export|default|let|var|if|else)\b/g, chalk.hex('#c678dd')('$1'))
    .replace(/(["'`].*?["'`])/g, chalk.hex('#98c379')('$1'))
    .replace(/\b(true|false|null|undefined|number|string|boolean)\b/g, chalk.hex('#d19a66')('$1'))
    .replace(/\b(console|JSON)\b/g, chalk.hex('#e5c07b')('$1'));
}

function formatDiffRow(text, type, maxCols = 80) {
  const bgRed = '\x1b[48;2;55;22;22m';
  const bgGreen = '\x1b[48;2;20;52;28m';
  const reset = '\x1b[0m';

  const raw = text || '';
  const padLen = Math.max(0, maxCols - raw.length - 4);
  const pad = ' '.repeat(padLen);

  if (type === 'del') {
    const colored = highlightTokens(raw).replace(/\x1b\[(0|39|49)m/g, '\x1b[0m' + bgRed);
    return `${bgRed}${chalk.red('▌')} ${colored}${pad}${reset}`;
  } else if (type === 'add') {
    const colored = highlightTokens(raw).replace(/\x1b\[(0|39|49)m/g, '\x1b[0m' + bgGreen);
    return `${bgGreen}${chalk.green('▌')} ${colored}${pad}${reset}`;
  } else {
    return `   ${chalk.dim(raw)}`;
  }
}

export function getCollapsedToolLine(type, details = {}) {
  switch (type) {
    case 'edit': {
      const addFmt = details.added !== undefined ? chalk.green(`+${details.added}`) : chalk.green('+7');
      const remFmt = details.removed !== undefined ? chalk.red(`-${details.removed}`) : chalk.red('-3');
      const fileName = details.file || 'repair-vm.mts';
      return `${chalk.bold('* Edited file')} ${chalk.white(fileName)} ${addFmt} ${remFmt}`.trim();
    }

    case 'command':
    case 'exec': {
      if (details.count && details.count > 1) {
        return `${chalk.bold('>_ Ran')} ${chalk.white(`${details.count} commands`)}`;
      }
      const cmd = details.command || details.name || "cd 'D:\\Omnicode\\Agents app'; Get-ChildItem";
      return `${chalk.bold('>_ Ran command')} ${chalk.dim(cmd)}`;
    }

    case 'read': {
      if (details.count && details.count > 1) {
        return `${chalk.bold('* Read')} ${chalk.white(`${details.count} files`)}`;
      }
      const file = details.file || details.name || 'core.ts';
      const range = details.lines ? chalk.dim(` (${details.lines})`) : '';
      return `${chalk.bold('* Read file')} ${chalk.white(file)}${range}`;
    }

    case 'search': {
      const query = details.query || details.name || 'createAcpDriver';
      return `${chalk.bold('* Searched function')} ${chalk.white(query)}`;
    }

    case 'explore': {
      const count = details.count || 2;
      return `${chalk.bold('* Explored')} ${chalk.white(`${count} searches`)}`;
    }

    case 'think': {
      const dur = details.duration || '2s';
      return `${chalk.bold('* Thought for')} ${chalk.white(dur)}`;
    }

    default:
      return `${chalk.bold('* Tool result')} ${chalk.dim(details.name || '')}`.trim();
  }
}

export function buildExpandedToolBlock(type, details = {}, cols = 90) {
  const lines = [];
  const contentWidth = Math.min(Math.max(40, cols - 4), 100);

  switch (type) {
    case 'edit': {
      const addFmt = details.added !== undefined ? chalk.green(`+${details.added}`) : chalk.green('+7');
      const remFmt = details.removed !== undefined ? chalk.red(`-${details.removed}`) : chalk.red('-3');
      const fileName = details.file || 'repair-vm.mts';
      const filePath = details.path || details.file || 'D:\\Omnicode\\Agents app\\.omb-scratch\\repair-vm.mts';

      lines.push(`${chalk.bold('* Edited file')} ${chalk.white(fileName)} ${addFmt} ${remFmt}`.trim());
      lines.push(chalk.dim(filePath));
      lines.push('');

      if (details.diff && details.diff.length > 0) {
        for (const d of details.diff) {
          if (d.type === 'del' || d.startsWith('-')) {
            const raw = d.startsWith('-') ? d.slice(1).trimStart() : d.text || d;
            lines.push(formatDiffRow(raw, 'del', contentWidth));
          } else if (d.type === 'add' || d.startsWith('+')) {
            const raw = d.startsWith('+') ? d.slice(1).trimStart() : d.text || d;
            lines.push(formatDiffRow(raw, 'add', contentWidth));
          } else {
            const raw = d.text || d;
            lines.push(formatDiffRow(raw, 'ctx', contentWidth));
          }
        }
      } else {
        // Exact diff block from screenshot
        lines.push(formatDiffRow('import { containerComputerAction, SHARED_LOCAL_VM_TARGET } from "./server/container-computer.ts";', 'del', contentWidth));
        lines.push(formatDiffRow('const step = async (a) => {', 'del', contentWidth));
        lines.push(formatDiffRow('import { containerComputerAction, SHARED_LOCAL_VM_TARGET } from "./server/container-computer.ts";', 'add', contentWidth));
        lines.push(formatDiffRow('const step = async (a: "remove" | "run") => {', 'add', contentWidth));
        lines.push(formatDiffRow('  const s = await containerComputerAction(a, undefined, undefined, SHARED_LOCAL_VM_TARGET);', 'ctx', contentWidth));
        lines.push(formatDiffRow('  console.log(a, "->", JSON.stringify(container: s.container, ready: s.ready, desktopReady: s.desktopReady, persistence: s.persistence, probl', 'del', contentWidth));
        lines.push(formatDiffRow('  console.log(a, "->", JSON.stringify({', 'add', contentWidth));
        lines.push(formatDiffRow('    container: s.container, ready: s.ready, desktopReady: s.desktopReady,', 'add', contentWidth));
        lines.push(formatDiffRow('    persistence: s.persistence, problem: s.problem,', 'add', contentWidth));
        lines.push(formatDiffRow('  }));', 'add', contentWidth));
        lines.push(formatDiffRow('};', 'ctx', contentWidth));
        lines.push(formatDiffRow('await step("remove");', 'ctx', contentWidth));
        lines.push(formatDiffRow('await step("run");', 'ctx', contentWidth));
      }
      break;
    }

    case 'command':
    case 'exec': {
      const count = details.count || 2;
      lines.push(`${chalk.bold('>_ Ran')} ${chalk.white(`${count} commands`)}`);
      lines.push('');

      if (details.commands && details.commands.length > 0) {
        for (const c of details.commands) {
          lines.push(`  ${chalk.dim('$')} ${chalk.white(c)}`);
        }
      } else {
        lines.push(`  ${chalk.dim('$')} ${chalk.white('cmd /c "podman exec -u cua -e HOME=/home/cua -e DISPLAY=:1 openmausbot-computer /usr/local/libexec/openmausbot/cua-driver status --socket /run/user/1000/openmausbot-cua.sock 2>&1"')}`);
        lines.push(`  ${chalk.dim('$')} ${chalk.white('cmd /c "podman exec -u cua -e HOME=/home/cua -e DISPLAY=:1 -e CUA_DRIVER_TELEMETRY_ENABLED=0 openmausbot-computer /usr/local/libexec/openmausbot/cua-driver call health_report {} --socket /run/user/1000/openmausbot-cua.sock 2>&1" | Select-Object -First 5')}`);
      }

      lines.push('');
      lines.push(`  ${chalk.dim('OUTPUT')}`);

      if (details.output && details.output.length > 0) {
        for (const out of details.output) {
          lines.push(`    ${chalk.dim(out)}`);
        }
      } else {
        lines.push(`    ${chalk.dim('user policy: configured=false, active=false, valid=true')}`);
        lines.push(`    ${chalk.dim('managed policy: configured=false, active=false, valid=true')}`);
        lines.push(`    ${chalk.dim('authorization host: unavailable (unavailable)')}`);
        lines.push(`    ${chalk.dim('capability manifest: configured=false, approved_at_startup=false, valid=true')}`);
      }

      lines.push('');
      lines.push(`  ${chalk.dim('$')} ${chalk.white('cmd /c "podman exec -u cua -e HOME=/home/cua -e DISPLAY=:1 -e CUA_DRIVER_TELEMETRY_ENABLED=0 openmausbot-computer /usr/local/libexec/openmausbot/cua-driver call health_report {} --socket /run/user/100 ... [command truncated: 53 more chars]')}`);
      lines.push(`  ${chalk.red('[Command exited with code 1]')}`);
      lines.push(`  ${chalk.dim('Cua Driver daemon is not running on /run/user/1000/openmausbot-cua-sock.')}`);
      lines.push(`  ${chalk.dim('Start it first with: cua-driver serve --socket /run/user/1000/openmausbot-cua-sock')}`);
      break;
    }

    case 'read': {
      const file = details.file || details.name || 'core.ts';
      const range = details.lines ? `(${details.lines})` : '';
      lines.push(`${chalk.bold('* Read file')} ${chalk.white(file)} ${chalk.dim(range)}`);
      lines.push(chalk.dim(`  Path: ${details.path || 'D:\\Omnicode\\Agents app\\core.ts'}`));
      lines.push(chalk.dim(`  Inspecting declarations, imports, and core ACP driver factory...`));
      break;
    }

    case 'search': {
      const query = details.query || details.name || 'createAcpDriver';
      lines.push(`${chalk.bold('* Searched function')} ${chalk.white(query)}`);
      lines.push(chalk.dim(`  Workspace: D:\\Omnicode\\Agents app`));
      lines.push(chalk.dim(`  Pattern: ${query} in *.ts, *.mts, *.js`));
      break;
    }

    default: {
      lines.push(`${chalk.bold('* Tool result')} ${chalk.dim(details.name || '')}`);
      lines.push(chalk.dim('  Action completed successfully.'));
      break;
    }
  }

  return lines;
}

export async function executeToolWithCollapse(tool, bottomBar, delayMs = 900) {
  const { cols } = bottomBar.getDimensions();

  // 1. Build and display the expanded view while active
  const expandedLines = buildExpandedToolBlock(tool.type, tool, cols);
  bottomBar.setStatus(`Running tool: ${tool.name || tool.type}...`);
  const block = bottomBar.writeExpandedBlock(expandedLines);

  // 2. Active execution delay
  await new Promise(resolve => setTimeout(resolve, delayMs));

  // 3. Clean collapse into single summary line
  const collapsedLine = getCollapsedToolLine(tool.type, tool);
  bottomBar.collapseBlock(block, collapsedLine);

  // 4. Render commentary line if provided
  if (tool.commentary) {
    bottomBar.writeLine(tool.commentary);
  }
}
