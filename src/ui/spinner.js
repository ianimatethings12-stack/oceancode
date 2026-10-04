import ora from 'ora';
import chalk from 'chalk';

export function createOceanSpinner(text = 'Thinking...') {
  return ora({
    text: chalk.dim(text),
    spinner: 'dots',
    color: 'gray',
  });
}

export function createToolSpinner(action, target) {
  return ora({
    text: `${chalk.dim(action)} ${target}`,
    spinner: 'dots',
    color: 'gray',
  });
}
