import { startChat } from './chat/engine.js';
import { setCursorNormal } from './ui/cursor.js';

export function runCLI() {
  setCursorNormal();
  console.clear();

  process.on('SIGINT', () => {
    setCursorNormal();
    console.log('\nBye!\n');
    process.exit(0);
  });

  process.on('exit', () => {
    setCursorNormal();
  });

  startChat();
}

runCLI();
