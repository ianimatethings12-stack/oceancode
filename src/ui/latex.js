import chalk from 'chalk';

const subMap = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ'
};

const supMap = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
  'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
  'T': 'ᵀ', 'H': 'ᴴ'
};

const symbolMap = {
  // Greek Lowercase
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η',
  '\\theta': 'θ', '\\vartheta': 'ϑ', '\\iota': 'ι', '\\kappa': 'κ',
  '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ',
  '\\pi': 'π', '\\varpi': 'ϖ', '\\rho': 'ρ', '\\varrho': 'ϱ',
  '\\sigma': 'σ', '\\varsigma': 'ς', '\\tau': 'τ', '\\upsilon': 'υ',
  '\\phi': 'φ', '\\varphi': 'ϕ', '\\chi': 'χ', '\\psi': 'ψ',
  '\\omega': 'ω',

  // Greek Uppercase
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
  '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Upsilon': 'Υ',
  '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω',

  // Operators & Calculus
  '\\sum': '∑', '\\prod': '∏', '\\int': '∫', '\\iint': '∬', '\\iiint': '∭',
  '\\oint': '∮', '\\partial': '∂', '\\nabla': '∇', '\\infty': '∞',

  // Relations & Logic
  '\\approx': '≈', '\\sim': '∼', '\\equiv': '≡', '\\neq': '≠', '\\ne': '≠',
  '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
  '\\ll': '≪', '\\gg': '≫',
  '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\cdot': '·', '\\div': '÷',
  '\\ast': '∗', '\\star': '⋆', '\\circ': '∘', '\\bullet': '•',

  // Set theory & logic
  '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\subseteq': '⊆',
  '\\supset': '⊃', '\\supseteq': '⊇', '\\cup': '∪', '\\cap': '∩',
  '\\setminus': '∖', '\\emptyset': '∅',
  '\\forall': '∀', '\\exists': '∃', '\\nexists': '∄',
  '\\neg': '¬', '\\land': '∧', '\\lor': '∨',

  // Arrows
  '\\rightarrow': '→', '\\to': '→', '\\leftarrow': '←',
  '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\Leftrightarrow': '⇔', '\\iff': '⇔',
  '\\uparrow': '↑', '\\downarrow': '↓',

  // Blackboard bold sets
  '\\mathbb{R}': 'ℝ', '\\mathbb{C}': 'ℂ', '\\mathbb{N}': 'ℕ',
  '\\mathbb{Z}': 'ℤ', '\\mathbb{Q}': 'ℚ', '\\mathbb{P}': 'ℙ',

  // Brackets and punctuation
  '\\langle': '⟨', '\\rangle': '⟩',
  '\\{': '{', '\\}': '}',
  '\\left(': '(', '\\right)': ')',
  '\\left[': '[', '\\right]': ']',
  '\\left\\{': '{', '\\right\\}': '}',
  '\\left|': '|', '\\right|': '|',
  '\\ldots': '…', '\\cdots': '⋯', '\\vdots': '⋮', '\\ddots': '⋱',
};

function toSubscript(str) {
  return str.split('').map(c => subMap[c] || c).join('');
}

function toSuperscript(str) {
  return str.split('').map(c => supMap[c] || c).join('');
}

function extractBraced(str, startIndex) {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

export function renderLatexMath(latex) {
  if (!latex) return '';

  let res = latex.trim();

  // Matrices: \begin{pmatrix} a & b \\ c & d \end{pmatrix} or \begin{bmatrix} ...
  res = res.replace(/\\begin\{(pmatrix|bmatrix|matrix)\}([\s\S]*?)\\end\{\1\}/g, (_, type, content) => {
    const rows = content.trim().split('\\\\').map(r => r.split('&').map(cell => renderLatexMath(cell.trim())));
    const isBrack = type === 'bmatrix';
    
    const colWidths = [];
    rows.forEach(row => {
      row.forEach((cell, ci) => {
        colWidths[ci] = Math.max(colWidths[ci] || 0, cell.length);
      });
    });

    const lines = rows.map((row, ri) => {
      const rowStr = row.map((cell, ci) => cell.padEnd(colWidths[ci])).join('  ');
      if (rows.length === 1) {
        return `[ ${rowStr} ]`;
      }
      if (ri === 0) {
        return (isBrack ? '⎡ ' : '⎛ ') + rowStr + (isBrack ? ' ⎤' : ' ⎞');
      } else if (ri === rows.length - 1) {
        return (isBrack ? '⎣ ' : '⎝ ') + rowStr + (isBrack ? ' ⎦' : ' ⎠');
      } else {
        return (isBrack ? '⎢ ' : '⎜ ') + rowStr + (isBrack ? ' ⎥' : ' ⎟');
      }
    });

    return '\n' + lines.map(l => '  ' + l).join('\n') + '\n';
  });

  // Handle \frac with balanced braces
  let fracIdx;
  while ((fracIdx = res.indexOf('\\frac')) !== -1) {
    const numStart = res.indexOf('{', fracIdx);
    if (numStart === -1) break;
    const num = extractBraced(res, numStart);
    if (!num) break;
    const denStart = res.indexOf('{', num.endIndex);
    if (denStart === -1) break;
    const den = extractBraced(res, denStart);
    if (!den) break;

    const replacement = `(${renderLatexMath(num.content)} / ${renderLatexMath(den.content)})`;
    res = res.slice(0, fracIdx) + replacement + res.slice(den.endIndex + 1);
  }

  // Handle \sqrt with balanced braces
  let sqrtIdx;
  while ((sqrtIdx = res.indexOf('\\sqrt')) !== -1) {
    const start = res.indexOf('{', sqrtIdx);
    if (start === -1 || start > sqrtIdx + 6) break;
    const arg = extractBraced(res, start);
    if (!arg) break;
    const replacement = `√(${renderLatexMath(arg.content)})`;
    res = res.slice(0, sqrtIdx) + replacement + res.slice(arg.endIndex + 1);
  }

  // Text unwraps
  res = res.replace(/\\(text|mathrm|mathbf)\{([^{}]+)\}/g, '$2');

  // Common symbols and Greek replacements
  for (const [sym, rep] of Object.entries(symbolMap)) {
    res = res.replaceAll(sym, rep);
  }

  // Balanced superscripts ^{...}
  let supIdx;
  while ((supIdx = res.indexOf('^{')) !== -1) {
    const arg = extractBraced(res, supIdx + 1);
    if (!arg) break;
    const inner = renderLatexMath(arg.content);
    res = res.slice(0, supIdx) + toSuperscript(inner) + res.slice(arg.endIndex + 1);
  }

  // Balanced subscripts _{...}
  let subIdx;
  while ((subIdx = res.indexOf('_{')) !== -1) {
    const arg = extractBraced(res, subIdx + 1);
    if (!arg) break;
    const inner = renderLatexMath(arg.content);
    res = res.slice(0, subIdx) + toSubscript(inner) + res.slice(arg.endIndex + 1);
  }

  // Single char subscript/superscript
  res = res.replace(/\^([0-9a-z+\-()])/gi, (_, exp) => toSuperscript(exp));
  res = res.replace(/_([0-9a-z+\-()])/gi, (_, sub) => toSubscript(sub));

  // Clean remaining braces and extra backslashes
  res = res.replace(/\\([a-zA-Z]+)/g, '$1');
  res = res.replace(/\{([^{}]+)\}/g, '$1');

  return res.trim();
}

export function formatLatexInMarkdown(line) {
  if (!line) return '';

  // Standalone matrix: \begin{...} ... \end{...}
  if (line.includes('\\begin{')) {
    return renderLatexMath(line);
  }

  // Block math: $$ ... $$
  if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
    const inner = line.trim().slice(2, -2);
    const rendered = renderLatexMath(inner);
    return `  ${chalk.bold(rendered)}`;
  }

  // Inline math: $...$
  return line.replace(/(?<!\$)\$([^$\n]+)\$(?!\$)/g, (_, math) => {
    const rendered = renderLatexMath(math);
    return chalk.bold(rendered);
  });
}
