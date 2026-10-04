import ora from 'ora';
import chalk from 'chalk';
import { setCursorNormal } from './cursor.js';

export function createOceanSpinner(text = 'Thinking...') {
  const spinner = ora({
    text: chalk.dim(text),
    spinner: {
      interval: 100,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    },
    color: 'gray',
    discardStdin: false,
  });

  const originalStop = spinner.stop.bind(spinner);
  spinner.stop = () => {
    originalStop();
    setCursorNormal();
    return spinner;
  };

  return spinner;
}

export function createToolSpinner(action, target) {
  return ora({
    text: `${chalk.dim(action)} ${target}`,
    spinner: {
      interval: 100,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    },
    color: 'gray',
    discardStdin: false,
  });
}
