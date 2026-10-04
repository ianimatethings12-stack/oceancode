import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import { state } from '../config.js';
import { formatMarkdown, formatInline, renderToolCall } from '../ui/markdown.js';
import { commands } from '../commands/handlers.js';
import { setCursorNormal } from '../ui/cursor.js';
import { renderBanner } from '../ui/banner.js';
import { BottomBar } from '../ui/bottomBar.js';
import { executeToolWithCollapse } from '../ui/tools.js';

let activeBottomBar = null;

export function startChat() {
  setCursorNormal();

  activeBottomBar = new BottomBar({
    onSubmit: async (input) => {
      await handleUserInput(input);
    },
    onExit: () => {
      setCursorNormal();
      console.log('\nBye!\n');
      process.exit(0);
    },
  });

  activeBottomBar.setupScrollingRegion();
  const bannerRows = renderBanner();
  activeBottomBar.setScrollRow(bannerRows + 1);
  activeBottomBar.start();
}

async function handleUserInput(input) {
  // Slash commands
  const [cmd, ...args] = input.split(' ');
  if (cmd.startsWith('/')) {
    if (cmd === '/exit') {
      activeBottomBar.stop();
      console.log('\nBye!\n');
      process.exit(0);
      return;
    }

    if (cmd === '/clear') {
      console.clear();
      activeBottomBar.setupScrollingRegion();
      const bannerRows = renderBanner();
      activeBottomBar.setScrollRow(bannerRows + 1);
      activeBottomBar.render();
      return;
    }

    if (commands[cmd]) {
      let captured = '';
      const originalLog = console.log;
      console.log = (...msgs) => {
        captured += msgs.join(' ') + '\n';
      };

      try {
        commands[cmd].run(args.join(' '));
      } finally {
        console.log = originalLog;
      }

      if (captured) {
        activeBottomBar.writeToScroll(captured.trimEnd());
      }
      activeBottomBar.render();
      return;
    } else {
      activeBottomBar.writeToScroll(`Unknown command: ${cmd} (type /help for available commands)`);
      return;
    }
  }

  // 1. Render user prompt in a clean sharp rectangle box in the scrolling viewport
  const formattedPrompt = formatInline(input);
  const promptBox = boxen(formattedPrompt, {
    borderStyle: 'single', // sharp, clean rectangle
    borderColor: 'gray',
    dimBorder: true,
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  activeBottomBar.writeToScroll(promptBox);

  const lower = input.toLowerCase();

  // 2. Multi-step or targeted tool execution
  if (lower.includes('opencode') || lower.includes('agent') || lower.includes('step') || lower.includes('acp')) {
    // Multi-step tool execution sequence identical to Image 3!
    activeBottomBar.setStatus('Thinking...');
    await new Promise(r => setTimeout(r, 400));
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('2s')}`);
    activeBottomBar.writeToScroll(`Found it — opencodeGo is an ACP driver. Let me read it and the ACP core's capabilities block...`);

    // Step 1: Read files
    await executeToolWithCollapse({
      type: 'read',
      count: 2,
      file: 'core.ts',
      lines: '494-1560',
      path: 'D:\\Omnicode\\Agents app\\core.ts',
      commentary: `Now let me find the ACP driver factory to see its capabilities declaration...`,
    }, activeBottomBar, 700);

    // Step 2: Ran command
    await executeToolWithCollapse({
      type: 'command',
      command: "cd 'D:\\Omnicode\\Agents app'; Get-ChildItem",
    }, activeBottomBar, 700);

    // Step 3: Search
    await executeToolWithCollapse({
      type: 'search',
      query: 'createAcpDriver',
      commentary: `This is the key file. Let me read the ACP core's capabilities block and verify...`,
    }, activeBottomBar, 700);

    // Step 4: Explored searches & read file
    activeBottomBar.writeToScroll(`${chalk.bold('* Explored')} ${chalk.white('2 searches')}`);
    await executeToolWithCollapse({
      type: 'read',
      file: 'core.ts',
      lines: '494-1560',
      path: 'D:\\Omnicode\\Agents app\\core.ts',
    }, activeBottomBar, 600);

    // Step 5: Second thought
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('4s')}`);
    activeBottomBar.writeToScroll(`Now let me find the ACP driver's capabilities declaration and server status...`);

    await executeToolWithCollapse({
      type: 'search',
      query: 'acpMcpServers',
      commentary: `Now let me see the rest of acpMcpServers (whether it includes computerMcp)...`,
    }, activeBottomBar, 600);

    // Step 6: Ran 2 commands
    await executeToolWithCollapse({
      type: 'command',
      count: 2,
    }, activeBottomBar, 700);

    // Step 7: Third thought & read
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('13s')}`);
    activeBottomBar.writeToScroll(`The ACP driver does declare computerMcp: true. So the gate isn't closed on the\nrunning server's status.`);

    await executeToolWithCollapse({
      type: 'read',
      file: 'index.ts',
      lines: '8690-8900',
      path: 'D:\\Omnicode\\Agents app\\index.ts',
    }, activeBottomBar, 600);

  } else if (lower.includes('edit') || lower.includes('modify') || lower.includes('repair') || lower.includes('vm') || lower.includes('patch') || lower.includes('change')) {
    // Shows the exact Image 1 diff during execution, then collapses!
    activeBottomBar.setStatus('Thinking...');
    await new Promise(r => setTimeout(r, 400));
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('2s')}`);
    activeBottomBar.writeToScroll(`Found it — opencodeGo is an ACP driver. Let me inspect repair-vm.mts and patch the container action...`);

    await executeToolWithCollapse({
      type: 'edit',
      file: 'repair-vm.mts',
      path: 'D:\\Omnicode\\Agents app\\.omb-scratch\\repair-vm.mts',
      added: 7,
      removed: 3,
      commentary: `Applied patch to repair-vm.mts with container action persistence update.`,
    }, activeBottomBar, 1100);

  } else if (lower.includes('run') || lower.includes('cmd') || lower.includes('podman') || lower.includes('cua') || lower.includes('exec') || lower.includes('command') || lower.includes('test')) {
    // Shows the exact Image 2 commands during execution, then collapses!
    activeBottomBar.setStatus('Thinking...');
    await new Promise(r => setTimeout(r, 400));

    await executeToolWithCollapse({
      type: 'command',
      count: 2,
    }, activeBottomBar, 1100);

    // Shows thought with progress bar from Image 4
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('16s')}`);
    activeBottomBar.writeToScroll(
      `${chalk.dim('│')} ${chalk.white('Progress: persistence: "durable" now. The container is running with the correct mount. The desktop failed to start just now — likely because the')}\n` +
      `${chalk.dim('│')} ${chalk.white('desktop takes time to boot (supervisor). Let me wait and re-check status via the live API.')}`
    );

  } else if (lower.includes('read') || lower.includes('file') || lower.includes('cat') || lower.includes('view') || lower.includes('core.ts')) {
    activeBottomBar.setStatus('Thinking...');
    await new Promise(r => setTimeout(r, 400));
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('2s')}`);

    await executeToolWithCollapse({
      type: 'read',
      file: 'core.ts',
      lines: '494-1560',
      path: 'D:\\Omnicode\\Agents app\\core.ts',
      commentary: `This is the key file. Let me read the ACP core's capabilities block and verify...`,
    }, activeBottomBar, 900);

  } else if (lower.includes('search') || lower.includes('find') || lower.includes('grep')) {
    activeBottomBar.setStatus('Thinking...');
    await new Promise(r => setTimeout(r, 400));
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('2s')}`);

    await executeToolWithCollapse({
      type: 'search',
      query: 'createAcpDriver',
      commentary: `Found 2 matches across workspace.`,
    }, activeBottomBar, 900);
  } else {
    // General queries - brief thought
    activeBottomBar.setStatus('Thinking...');
    await new Promise(r => setTimeout(r, 300));
    activeBottomBar.writeToScroll(`${chalk.bold('* Thought for')} ${chalk.white('2s')}`);
  }

  // 4. Stream assistant response
  activeBottomBar.setStatus('Generating response...');
  const responseMarkdown = generateAssistantResponse(input);
  const formatted = formatMarkdown(responseMarkdown);
  const lines = formatted.split('\n');

  await activeBottomBar.streamLines(lines, 12);

  // 5. Update token metrics
  const tokenCount = Math.floor(input.length / 3) + Math.floor(responseMarkdown.length / 3.5);
  state.tokensUsed += tokenCount;

  // 6. Clear status and re-activate input prompt
  activeBottomBar.clearStatus();
}

function generateAssistantResponse(prompt) {
  const p = prompt.toLowerCase();

  // Math & LaTeX request
  if (p.includes('math') || p.includes('latex') || p.includes('formula') || p.includes('equation') || p.includes('matrix')) {
    return `### Mathematical Formulation & Proof

Here is the formulation with LaTeX rendering:

The general quadratic solution for $ax^2 + bx + c = 0$ is:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### Key Properties
  • Discriminant analysis:
    ◦ $\\Delta > 0$: Two distinct real roots
    ◦ $\\Delta = 0$: Single degenerate root ($x = -\\frac{b}{2a}$)
    ◦ $\\Delta < 0$: Conjugate complex roots in $\\mathbb{C}$
  • Transformation Matrix:
\\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}

Euler's identity holds that $e^{i\\pi} + 1 = 0$, where $\\pi \\approx 3.14159$.`;
  }

  // Table request
  if (p.includes('table') || p.includes('compare') || p.includes('benchmark')) {
    return `### Performance Benchmark

| Model | Context Window | Accuracy | Throughput |
| :--- | :---: | :---: | ---: |
| Ocean 3.5 Deep | 200k tokens | 98.4% | 110 t/s |
| Claude 3.7 Sonnet | 200k tokens | 97.9% | 95 t/s |
| Gemini 2.5 Pro | 1000k tokens | 96.8% | 85 t/s |

### Evaluation Summary
  • Benchmark execution completed in 1.4s
  • Memory consumption remained within bounds ($O(1)$ auxiliary space)
  • Ready for production deployment`;
  }

  // Greeting
  if (p.includes('hi') || p.includes('hello') || p.includes('hey')) {
    return `Hello! I'm Ocean Code, your coding assistant.

What would you like to work on?
  • Project Setup: Initialize microservices, web apps, or CLI tools
  • Mathematical & Algorithm Design: Proofs, equations, and complex analysis
  • Refactoring: Clean up structure, add TypeScript types, reduce technical debt
  • Debugging: Analyze errors, logs, and stack traces

Type your prompt below, ask for formulas, tables, or run /help for available commands.`;
  }

  // Files
  if (p.includes('file') || p.includes('list') || p.includes('dir')) {
    let files = [];
    try {
      files = fs.readdirSync(state.cwd);
    } catch {}

    const fileList = files.map(f => `  • \`${f}\``).join('\n');
    return `### Current Workspace Inventory
Inspected \`${state.cwd}\`:

${fileList || '  • (Empty directory)'}

You can ask me to inspect, create, or modify any file.`;
  }

  // Code request
  if (p.includes('typescript') || p.includes('queue') || p.includes('async')) {
    return `Here is an async queue implementation in TypeScript:

\`\`\`typescript
export class AsyncQueue<T> {
  private queue: (() => Promise<T>)[] = [];
  private activeCount: number = 0;

  constructor(private readonly concurrency: number = 4) {}

  public async add<R>(task: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.activeCount++;
    const nextTask = this.queue.shift();

    if (nextTask) {
      try {
        await nextTask();
      } finally {
        this.activeCount--;
        this.processNext();
      }
    }
  }
}
\`\`\`

### Architecture Specifications
  • Concurrency bounds: strictly enforce active worker limits
  • Task complexity: amortized $O(1)$ enqueue and dequeue operations
  • Rejection safety: individual failures do not disrupt the pipeline`;
  }

  return `I've received your request: "${prompt}".

### Recommended Approach
  • Architecture: Separate interface from domain logic
  • Robustness: Verify invariants and boundary conditions
  • Performance: Ensure $O(n)$ or better algorithmic bounds

\`\`\`javascript
export async function runTask(task) {
  const result = await task.run();
  return { status: 'complete', result };
}
\`\`\`

Let me know how you'd like to proceed.`;
}
