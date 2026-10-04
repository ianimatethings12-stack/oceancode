import ora from 'ora';
import chalk from 'chalk';

export function createOceanSpinner(text = 'Thinking...') {
  return ora({
    text: chalk.hex('#00f2fe')(text),
    spinner: {
      interval: 80,
      frames: ['🌊 ∿∿∿', '🌊 ≈≈≈', '🌊 ≋≋≋', '🌊 ∿≈≋', '🌊 ≈≋∿', '🌊 ≋∿≈'],
    },
    color: 'cyan',
  });
}

export function createToolSpinner(action, target) {
  return ora({
    text: `${chalk.dim(action)} ${chalk.hex('#4facfe')(target)}`,
    spinner: 'dots',
    color: 'cyan',
  });
}
