import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import { state } from '../config.js';
import { formatMarkdown, renderToolCall } from '../ui/markdown.js';
import { createOceanSpinner } from '../ui/spinner.js';
import { commands } from '../commands/handlers.js';

export function startChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: getPromptString(),
    historySize: 100,
  });

  let multilineBuffer = [];
  let isMultilineMode = false;

  rl.prompt();

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
          rl.prompt();
        }
      } else {
        rl.prompt();
      }
      return;
    }

    const input = rawInput.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    // Slash commands
    const [cmd, ...args] = input.split(' ');
    if (cmd.startsWith('/') && commands[cmd]) {
      commands[cmd].run(args.join(' '));
      rl.prompt();
      return;
    } else if (cmd.startsWith('/') && !commands[cmd]) {
      console.log(`Unknown command: ${cmd} (type /help for available commands)`);
      rl.prompt();
      return;
    }

    // Regular conversation query
    rl.pause();
    try {
      await handleUserInput(input, rl);
    } finally {
      rl.resume();
      rl.prompt();
    }
  });

  rl.on('close', () => {
    console.log('\nBye!\n');
    process.exit(0);
  });
}

function getPromptString() {
  return 'ocean> ';
}

async function handleUserInput(userInput, rl) {
  // No user bubble or 'You' header. Input remains on the 'ocean> ' prompt line.

  // Spinner
  const spinner = createOceanSpinner('Thinking...');
  spinner.start();

  const startTime = Date.now();
  await new Promise(resolve => setTimeout(resolve, 600));

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
  console.log('');
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

  if (p.includes('hi') || p.includes('hello') || p.includes('hey')) {
    return `Hello! I'm Ocean Code, your coding assistant.

What would you like to work on?
- Project Setup: Initialize microservices, web apps, or CLI tools
- Refactoring: Clean up structure, add TypeScript types, reduce technical debt
- Debugging: Analyze errors, logs, and stack traces
- Testing: Write and run unit or integration tests

Type your prompt or run /help for available commands.`;
  }

  if (p.includes('file') || p.includes('list') || p.includes('dir')) {
    let files = [];
    try {
      files = fs.readdirSync(state.cwd);
    } catch {}

    const fileList = files.map(f => `- ${f}`).join('\n');
    return `Files in ${state.cwd}:

${fileList || '- (Empty directory)'}

You can ask me to inspect, create, or modify any file.`;
  }

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

Key points:
- Concurrency limit prevents resource exhaustion
- Resolves promises seamlessly with async/await
- Task errors are isolated and do not block subsequent queue tasks`;
  }

  return `I've received your request: "${prompt}".

Recommended approach:
1. Design: Keep interface and logic separate
2. Implementation: Modular, typed functions
3. Testing: Verify edge cases

\`\`\`javascript
export async function runTask(task) {
  const result = await task.run();
  return { status: 'complete', result };
}
\`\`\`

Let me know how you'd like to proceed.`;
}
