import readline from 'readline';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import { state } from '../config.js';
import { formatMarkdown, renderToolCall } from '../ui/markdown.js';
import { createOceanSpinner } from '../ui/spinner.js';
import { commands } from '../commands/handlers.js';
import { setCursorNormal, resetCursor } from '../ui/cursor.js';

export function startChat() {
  setCursorNormal();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: getPromptString(),
    historySize: 100,
  });

  const promptWithCursor = () => {
    setCursorNormal();
    rl.prompt();
  };

  let multilineBuffer = [];
  let isMultilineMode = false;

  promptWithCursor();

  rl.on('line', async (line) => {
    const rawInput = line.trimEnd();

    // Multi-line continuation (line ending with backslash '\')
    if (rawInput.endsWith('\\')) {
      multilineBuffer.push(rawInput.slice(0, -1));
      isMultilineMode = true;
      rl.setPrompt(chalk.dim('... '));
      rl.prompt();
      return;
    }

    if (isMultilineMode) {
      multilineBuffer.push(rawInput);
      const fullInput = multilineBuffer.join('\n').trim();
      multilineBuffer = [];
      isMultilineMode = false;
      rl.setPrompt(getPromptString());

      if (fullInput) {
        rl.pause();
        try {
          await handleUserInput(fullInput, rl);
        } finally {
          rl.resume();
          promptWithCursor();
        }
      } else {
        promptWithCursor();
      }
      return;
    }

    const input = rawInput.trim();

    if (!input) {
      promptWithCursor();
      return;
    }

    // Slash commands
    const [cmd, ...args] = input.split(' ');
    if (cmd.startsWith('/') && commands[cmd]) {
      commands[cmd].run(args.join(' '));
      promptWithCursor();
      return;
    } else if (cmd.startsWith('/') && !commands[cmd]) {
      console.log(`Unknown command: ${cmd} (type /help for available commands)`);
      promptWithCursor();
      return;
    }

    // Regular conversation query
    rl.pause();
    try {
      await handleUserInput(input, rl);
    } finally {
      rl.resume();
      promptWithCursor();
    }
  });

  rl.on('close', () => {
    setCursorNormal();
    console.log('\nBye!\n');
    process.exit(0);
  });
}

function getPromptString() {
  return 'ocean> ';
}

function renderUserPromptBox(prompt) {
  const promptBox = boxen(prompt, {
    borderStyle: 'single', // sharp, clean rectangle
    borderColor: 'gray',
    dimBorder: true,
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  console.log('\n' + promptBox + '\n');
}

async function handleUserInput(userInput, rl) {
  // Render user prompt in a clean sharp rectangle
  renderUserPromptBox(userInput);

  // Spinner
  const spinner = createOceanSpinner('Thinking...');
  spinner.start();

  const startTime = Date.now();
  await new Promise(resolve => setTimeout(resolve, 500));

  let simulatedTool = null;
  const lower = userInput.toLowerCase();
  
  if (lower.includes('file') || lower.includes('dir') || lower.includes('list') || lower.includes('ls')) {
    simulatedTool = { type: 'read', name: 'fs.readdir(' + state.cwd + ')' };
  } else if (lower.includes('git') || lower.includes('commit') || lower.includes('branch')) {
    simulatedTool = { type: 'git', name: 'git status --short' };
  } else if (lower.includes('run') || lower.includes('test') || lower.includes('exec')) {
    simulatedTool = { type: 'exec', name: 'node --version' };
  }

  spinner.stop();

  // Tool execution
  if (simulatedTool) {
    renderToolCall(simulatedTool.type, simulatedTool.name, 'success');
  }

  // Assistant response
  const responseMarkdown = generateAssistantResponse(userInput);
  await streamMarkdown(responseMarkdown);
  console.log('');

  const tokenCount = Math.floor(userInput.length / 3) + Math.floor(responseMarkdown.length / 3.5);
  state.tokensUsed += tokenCount;
}

async function streamMarkdown(markdownText) {
  const formatted = formatMarkdown(markdownText);
  const lines = formatted.split('\n');

  for (const line of lines) {
    console.log(line);
    await new Promise(resolve => setTimeout(resolve, 15));
  }
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

Type your prompt, ask for formulas, tables, or run /help for available commands.`;
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
