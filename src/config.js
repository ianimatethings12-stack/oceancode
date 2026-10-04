import path from 'path';
import { execSync } from 'child_process';

function getGitBranch() {
  try {
    const branch = execSync('git branch --show-current', {
      stdio: ['pipe', 'pipe', 'ignore'],
      encoding: 'utf-8',
    }).trim();
    if (branch) return branch;
    return execSync('git rev-parse --abbrev-ref HEAD', {
      stdio: ['pipe', 'pipe', 'ignore'],
      encoding: 'utf-8',
    }).trim() || 'none';
  } catch {
    return 'none';
  }
}

export const state = {
  version: '0.1.0-preview',
  model: 'ocean-3.5-deep',
  mode: 'Interactive (Code & Architect)',
  tokensUsed: 0,
  contextLimit: 200000,
  cwd: process.cwd(),
  gitBranch: getGitBranch(),
  theme: 'ocean',
  availableModels: [
    { id: 'ocean-3.5-deep', name: 'Ocean 3.5 Deep (Recommended)', speed: 'Fast', desc: 'SOTA coding & reasoning' },
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Hybrid)', speed: 'Fast', desc: 'Hybrid reasoning agent' },
    { id: 'ocean-abyss-r1', name: 'Ocean Abyss R1', speed: 'Deep', desc: 'High-depth mathematical coding' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', speed: 'Ultra', desc: '1M context window multi-repo' },
  ],
};

export function updateGitBranch() {
  state.gitBranch = getGitBranch();
}
