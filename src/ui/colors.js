import chalk from 'chalk';
import gradient from 'gradient-string';

// Ocean Color Palettes
export const palettes = {
  ocean: ['#00f2fe', '#4facfe', '#0072ff'],
  bioluminescence: ['#38ef7d', '#11998e', '#00f2fe', '#4facfe'],
  deepTide: ['#4facfe', '#0072ff', '#000046'],
  coralReef: ['#ff758c', '#ff7eb3', '#00f2fe'],
  electricAqua: ['#0575e6', '#00f260', '#00f2fe'],
};

// Gradients
export const oceanGrad = gradient(palettes.ocean);
export const bioGrad = gradient(palettes.bioluminescence);
export const coralGrad = gradient(palettes.coralReef);
export const aquaGrad = gradient(palettes.electricAqua);

// Individual themed colors
export const colors = {
  primary: chalk.hex('#00f2fe'),       // Bright Cyan
  secondary: chalk.hex('#4facfe'),     // Sky Blue
  deep: chalk.hex('#0072ff'),          // Deep Ocean
  neon: chalk.hex('#38ef7d'),          // Seaweed Neon Green
  coral: chalk.hex('#ff6b6b'),         // Coral Red
  warning: chalk.hex('#ffd166'),       // Amber warning
  white: chalk.hex('#f0f8ff'),         // Sea foam white
  muted: chalk.hex('#708090'),         // Slate gray
  dim: chalk.hex('#4a5568'),           // Deep dim
  darkBg: chalk.hex('#0a192f'),        // Abyssal navy
  border: chalk.hex('#00a8cc'),        // Aqua border
  codeBg: chalk.hex('#1b2a4a'),        // Navy code background
  toolBadge: chalk.bgHex('#0f3460').hex('#00f2fe'),
  modelBadge: chalk.bgHex('#004e92').hex('#ffffff').bold,
};
