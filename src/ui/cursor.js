/**
 * Terminal cursor shape controls via DECSCUSR ANSI escapes:
 * 0: Terminal default
 * 1: Blinking block (classic normal terminal cursor)
 * 2: Steady block
 * 3: Blinking underline
 * 4: Steady underline
 * 5: Blinking bar (straight line |)
 * 6: Steady bar (straight line |)
 */

export function setCursorNormal() {
  if (process.stdout.isTTY) {
    // Set to normal blinking block cursor and ensure visible
    process.stdout.write('\x1b[?25h\x1b[1 q');
  }
}

export function setCursorBlock() {
  if (process.stdout.isTTY) {
    process.stdout.write('\x1b[?25h\x1b[2 q');
  }
}

export function resetCursor() {
  if (process.stdout.isTTY) {
    process.stdout.write('\x1b[?25h\x1b[0 q');
  }
}
