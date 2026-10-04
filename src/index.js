import { renderBanner } from './ui/banner.js';
import { startChat } from './chat/engine.js';
import { oceanGrad } from './ui/colors.js';

export function runCLI() {
  // Clear screen and show ocean banner
  console.clear();
  renderBanner();

  // Handle graceful exits
  process.on('SIGINT', () => {
    console.log('\n' + oceanGrad('  🌊 Ocean Code session paused. Smooth sailing!') + '\n');
    process.exit(0);
  });

  // Start chat loop
  startChat();
}

runCLI();
