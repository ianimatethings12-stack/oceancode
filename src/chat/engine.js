import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import { state } from '../config.js';
import { formatMarkdown, formatInline, renderToolCall } from '../ui/markdown.js';
import { commands } from '../commands/handlers.js';
import { setCursorNormal } from '../ui/cursor.js';
import { renderBanner } from '../ui/banner.js';
import { BottomBar } from '../ui/bottomBar.js';

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

  // 2. Set bottom bar status
  activeBottomBar.setStatus('Thinking...');
  await new Promise(resolve => setTimeout(resolve, 400));

  // 3. Tool execution simulation
  let simulatedTool = null;
  const lower = input.toLowerCase();
  
  if (lower.includes('file') || lower.includes('dir') || lower.includes('list') || lower.includes('ls')) {
    simulatedTool = { type: 'read', name: 'fs.readdir(' + state.cwd + ')' };
  } else if (lower.includes('git') || lower.includes('commit') || lower.includes('branch')) {
    simulatedTool = { type: 'git', name: 'git status --short' };
  } else if (lower.includes('run') || lower.includes('test') || lower.includes('exec')) {
    simulatedTool = { type: 'exec', name: 'node --version' };
  }

  if (simulatedTool) {
    const toolOutput = `[${simulatedTool.type}] ${simulatedTool.name} ${chalk.dim('✓')}`;
    activeBottomBar.writeToScroll(toolOutput);
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
