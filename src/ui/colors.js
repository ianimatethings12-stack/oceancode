import chalk from 'chalk';

// Basic, clean neutral styling - no extra neon or gradients
export const colors = {
  primary: chalk.bold.white,
  secondary: chalk.white,
  dim: chalk.dim,
  muted: chalk.gray,
  bold: chalk.bold,
  border: chalk.dim,
};

// Simple text pass-through for gradient backward-compatibility
export const oceanGrad = (text) => chalk.bold.white(text);
export const bioGrad = (text) => text;
export const coralGrad = (text) => text;
export const aquaGrad = (text) => text;

export function renderHr() {
  const width = Math.min(process.stdout.columns || 80, 80);
  return chalk.dim('─'.repeat(width));
}
