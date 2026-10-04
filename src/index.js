import { renderBanner } from './ui/banner.js';
import { startChat } from './chat/engine.js';

export function runCLI() {
  console.clear();
  renderBanner();

  process.on('SIGINT', () => {
    console.log('\nBye!\n');
    process.exit(0);
  });

  startChat();
}

runCLI();
