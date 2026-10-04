import { renderBanner } from './ui/banner.js';
import { startChat } from './chat/engine.js';
import { setCursorNormal } from './ui/cursor.js';

export function runCLI() {
  setCursorNormal();
  console.clear();
  renderBanner();

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
