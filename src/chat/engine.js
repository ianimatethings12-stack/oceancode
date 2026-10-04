import readline from 'readline';
import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { state } from '../config.js';
import { oceanGrad, bioGrad, colors } from '../ui/colors.js';
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

    // Check for multi-line continuation (line ending with backslash '\')
    if (rawInput.endsWith('\\')) {
      multilineBuffer.push(rawInput.slice(0, -1));
      isMultilineMode = true;
      rl.setPrompt(chalk.dim('   ... '));
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

    // Check slash commands
    const [cmd, ...args] = input.split(' ');
    if (cmd.startsWith('/') && commands[cmd]) {
      commands[cmd].run(args.join(' '));
      rl.prompt();
      return;
    } else if (cmd.startsWith('/') && !commands[cmd]) {
      console.log(`\n  ${chalk.hex('#ff6b6b')('Unknown command:')} ${cmd} ${chalk.dim('(type /help for available commands)')}\n`);
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
    console.log('\n' + oceanGrad('  🌊 Leaving Ocean Code. See you next tide!') + '\n');
    process.exit(0);
  });
}

function getPromptString() {
  return `${chalk.bold.hex('#00f2fe')('🌊 ocean')} ${chalk.hex('#4facfe')('›')} `;
}

async function handleUserInput(userInput, rl) {
  // 1. Render User query card
  renderUserCard(userInput);

  // 2. Start Animated Ocean Spinner
  const spinner = createOceanSpinner('Surfing code waves & reasoning...');
  spinner.start();

  const startTime = Date.now();

  // Simulate thinking / response processing
  await new Promise(resolve => setTimeout(resolve, 800));

  // Check if query is about workspace files or git to demonstrate real tool integration
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

  // 3. Render Tool execution if applicable
  if (simulatedTool) {
    renderToolCall(simulatedTool.type, simulatedTool.name, 'success');
    console.log('');
  }

  // 4. Generate Assistant Response
  const responseMarkdown = generateAssistantResponse(userInput);
  
  // 5. Stream response with a clean typewriter feel
  renderAssistantHeader();
  await streamMarkdown(responseMarkdown);

  // 6. Metrics footer
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const tokenCount = Math.floor(userInput.length / 3) + Math.floor(responseMarkdown.length / 3.5);
  state.tokensUsed += tokenCount;

  const footer = `  ${chalk.dim('✦')} ${chalk.hex('#4facfe')(state.model)} ${chalk.dim('•')} ${chalk.hex('#708090')(duration + 's')} ${chalk.dim('•')} ${chalk.hex('#38ef7d')(tokenCount + ' tokens')} ${chalk.dim('•')} ${chalk.hex('#708090')('context: ' + Math.round((state.tokensUsed / state.contextLimit) * 100) + '%')}`;
  console.log('\n' + footer + '\n');
}

function renderUserCard(input) {
  console.log('');
  const userBox = boxen(chalk.white(input), {
    title: chalk.bold.hex('#ffd166')(' You '),
    titleAlignment: 'left',
    borderColor: '#3a7bd5',
    borderStyle: 'round',
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  console.log(userBox + '\n');
}

function renderAssistantHeader() {
  console.log(`  ${chalk.bold.hex('#00f2fe')('🌊 Ocean Code')} ${chalk.dim('(' + state.model + ')')}`);
}

async function streamMarkdown(markdownText) {
  const formatted = formatMarkdown(markdownText);
  const lines = formatted.split('\n');

  for (const line of lines) {
    console.log('  ' + line);
    await new Promise(resolve => setTimeout(resolve, 25));
  }
}

function generateAssistantResponse(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes('hi') || p.includes('hello') || p.includes('hey')) {
    return `<think>
User initialized communication. Present Ocean Code agentic architecture and readiness.
</think>
Hello! I'm **Ocean Code**, your autonomous terminal coding companion.

I can help you build features, refactor code, debug complex issues, and navigate codebases just like Claude Code and OpenCode.

### What would you like to build?
* 🚀 **Project Setup**: Initialize microservices, web apps, or CLI tools
* 🛠️ **Refactoring**: Modernize architecture, add TypeScript types, clean up technical debt
* ⚡ **Debugging**: Analyze stack traces and optimize execution bottlenecks
* 🧪 **Testing**: Generate comprehensive test suites with high coverage

> Try asking: *"Show me an example of an asynchronous queue in TypeScript"* or run \`/help\` for commands.`;
  }

  if (p.includes('file') || p.includes('list') || p.includes('dir')) {
    let files = [];
    try {
      files = fs.readdirSync(state.cwd);
    } catch {}

    const fileList = files.map(f => `* \`${f}\``).join('\n');
    return `<think>
Inspecting filesystem hierarchy in ${state.cwd}.
Found ${files.length} items. Formatted clean inventory.
</think>
### Current Workspace Directory Contents
Inspected \`${state.cwd}\`:

${fileList || '* *(Directory is empty)*'}

You can ask me to inspect, create, or modify any of these files!`;
  }

  if (p.includes('typescript') || p.includes('queue') || p.includes('async')) {
    return `<think>
Drafting production-grade TypeScript AsyncQueue with concurrency limits and event hooks.
</think>
Here is a high-performance **AsyncQueue** implementation in TypeScript:

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

### Key Features
* 🔒 **Strict Concurrency Control**: Prevents rate-limiting and thread pool exhaustion
* 💡 **Promise-based resolution**: Seamlessly integrates with \`await\` syntax
* 🛡️ **Fail-Safe**: Rejection in individual tasks doesn't halt the queue`;
  }

  // Default intelligent assistant response
  return `<think>
Analyzing prompt: "${prompt}".
Formulating architectural response with structured actionable steps.
</think>
I've analyzed your request: **"${prompt}"**.

### Overview & Recommended Approach
1. **Design Architecture**: Separate UI presentation layer from domain logic
2. **Execute Cleanly**: Keep functions pure, typed, and modular
3. **Verify Continuously**: Test edge cases and maintain instant feedback loops

\`\`\`javascript
// Example Ocean Code snippet
export async function oceanPipeline(task) {
  console.log(\`🌊 Executing task: \${task.id}\`);
  const result = await task.run();
  return { status: 'complete', result };
}
\`\`\`

Let me know if you would like me to generate files or dive deeper into any specific aspect!`;
}
