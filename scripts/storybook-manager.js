#!/usr/bin/env node

/**
 * Storybook Manager - Manage multiple Storybook instances across worktrees
 *
 * Commands:
 *   start   - Start Storybook from current directory
 *   stop    - Stop Storybook for current directory
 *   status  - Show all running Storybook instances
 *   stop-all - Stop all running Storybook instances
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
// Use ~/.claude/ if it exists, otherwise fall back to home directory
const REGISTRY_FILE = fs.existsSync(CLAUDE_DIR)
  ? path.join(CLAUDE_DIR, 'storybook-instances.json')
  : path.join(os.homedir(), '.storybook-instances.json');
const BASE_PORT = 6006;
const MAX_PORT = 6020;

/**
 * Load the registry of running instances
 */
function loadRegistry() {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    }
  } catch {
    // Ignore parse errors, start fresh
  }
  return { instances: [] };
}

/**
 * Save the registry
 */
function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

/**
 * Get branch name from git
 */
function getBranchName(cwd) {
  try {
    return execSync('git branch --show-current', { cwd, encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Check if a process is still running
 */
function isProcessRunning(pid) {
  try {
    // Sending signal 0 checks if process exists without killing it
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a port is in use
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Find the next available port
 */
async function findAvailablePort(registry) {
  const usedPorts = new Set(registry.instances.map((i) => i.port));

  for (let port = BASE_PORT; port <= MAX_PORT; port++) {
    if (!usedPorts.has(port) && !(await isPortInUse(port))) {
      return port;
    }
  }
  throw new Error(`No available ports between ${BASE_PORT} and ${MAX_PORT}`);
}

/**
 * Clean up stale instances (processes that are no longer running)
 */
function cleanupStaleInstances(registry) {
  const before = registry.instances.length;
  registry.instances = registry.instances.filter((instance) => isProcessRunning(instance.pid));
  const removed = before - registry.instances.length;
  if (removed > 0) {
    saveRegistry(registry);
    console.log(`Cleaned up ${removed} stale instance(s)`);
  }
  return registry;
}

/**
 * Normalize path for comparison (handle Windows paths)
 */
function normalizePath(p) {
  return path.resolve(p).toLowerCase().replace(/\\/g, '/');
}

/**
 * Ensure prerequisites are met (node_modules, dist)
 */
function ensurePrerequisites(cwd) {
  const nodeModulesPath = path.join(cwd, 'node_modules');
  const distPath = path.join(cwd, 'dist');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';

  // Check node_modules
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('node_modules not found, running npm install...');
    execSync(`${npmCmd} install`, { cwd, stdio: 'inherit' });
    console.log('npm install completed\n');
  }

  // Check dist folder
  if (!fs.existsSync(distPath)) {
    console.log('dist folder not found, running npm run build...');
    execSync(`${npmCmd} run build`, { cwd, stdio: 'inherit' });
    console.log('build completed\n');
  }

  // The icon registry and the logo are generated and not in the repository.
  // `npm run storybook` builds them in its pre-hook; this starts Storybook
  // directly, so it does the same here.
  execSync(`${npmCmd} run build:icons`, { cwd, stdio: 'ignore' });
}

/**
 * Start Storybook
 */
async function start() {
  const cwd = process.cwd();
  const registry = cleanupStaleInstances(loadRegistry());

  // Check if already running from this directory
  const existing = registry.instances.find((i) => normalizePath(i.path) === normalizePath(cwd));
  if (existing && isProcessRunning(existing.pid)) {
    console.log(`Storybook already running for this directory`);
    console.log(`  Branch: ${existing.branch}`);
    console.log(`  URL:    http://localhost:${existing.port}`);
    console.log(`  PID:    ${existing.pid}`);
    return;
  }

  // Ensure node_modules and dist exist
  ensurePrerequisites(cwd);

  // Find available port
  const port = await findAvailablePort(registry);
  const branch = getBranchName(cwd);

  console.log(`Starting Storybook...`);
  console.log(`  Branch: ${branch}`);
  console.log(`  Port:   ${port}`);
  console.log(`  Path:   ${cwd}`);

  // Start Storybook
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';

  const child = spawn(npxCmd, ['storybook', 'dev', '-p', String(port)], {
    cwd,
    detached: true,
    stdio: 'ignore',
    shell: isWindows,
  });

  child.unref();

  // Save to registry
  registry.instances.push({
    port,
    pid: child.pid,
    path: cwd,
    branch,
    startedAt: new Date().toISOString(),
  });
  saveRegistry(registry);

  console.log(`\nStorybook starting at http://localhost:${port}`);
  console.log(`PID: ${child.pid}`);
}

/**
 * Stop Storybook for current directory
 */
function stop() {
  const cwd = process.cwd();
  const registry = cleanupStaleInstances(loadRegistry());

  const index = registry.instances.findIndex((i) => normalizePath(i.path) === normalizePath(cwd));
  if (index === -1) {
    console.log('No Storybook instance running for this directory');
    return;
  }

  const instance = registry.instances[index];

  try {
    if (process.platform === 'win32') {
      // On Windows, use taskkill to kill the process tree
      execSync(`taskkill /PID ${instance.pid} /T /F`, { stdio: 'ignore' });
    } else {
      // On Unix, kill the process group
      process.kill(-instance.pid, 'SIGTERM');
    }
    console.log(`Stopped Storybook for ${instance.branch} (PID: ${instance.pid})`);
  } catch (err) {
    console.log(`Process ${instance.pid} already stopped`);
  }

  registry.instances.splice(index, 1);
  saveRegistry(registry);
}

/**
 * Show status of all instances
 */
function status() {
  const registry = cleanupStaleInstances(loadRegistry());

  if (registry.instances.length === 0) {
    console.log('No Storybook instances running');
    return;
  }

  console.log('Running Storybook instances:\n');

  // Find max branch length for alignment
  const maxBranchLen = Math.max(...registry.instances.map((i) => i.branch.length), 6);

  for (const instance of registry.instances) {
    const branchPadded = instance.branch.padEnd(maxBranchLen);
    const url = `http://localhost:${instance.port}`;
    console.log(`  ${branchPadded}  ${url}  (PID ${instance.pid})`);
  }
  console.log('');
}

/**
 * Stop all instances
 */
function stopAll() {
  const registry = loadRegistry();

  if (registry.instances.length === 0) {
    console.log('No Storybook instances running');
    return;
  }

  console.log(`Stopping ${registry.instances.length} instance(s)...`);

  for (const instance of registry.instances) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /PID ${instance.pid} /T /F`, { stdio: 'ignore' });
      } else {
        process.kill(-instance.pid, 'SIGTERM');
      }
      console.log(`  Stopped ${instance.branch} (PID: ${instance.pid})`);
    } catch {
      console.log(`  ${instance.branch} already stopped`);
    }
  }

  registry.instances = [];
  saveRegistry(registry);
  console.log('All instances stopped');
}

/**
 * Main entry point
 */
const command = process.argv[2];

switch (command) {
  case 'start':
    start();
    break;
  case 'stop':
    stop();
    break;
  case 'status':
    status();
    break;
  case 'stop-all':
    stopAll();
    break;
  default:
    console.log(`
Storybook Manager - Manage multiple Storybook instances

Usage: node scripts/storybook-manager.js <command>

Commands:
  start     Start Storybook from current directory (auto-assigns port)
  stop      Stop Storybook for current directory
  status    Show all running Storybook instances
  stop-all  Stop all running Storybook instances

Examples:
  npm run sb:start    # Start Storybook
  npm run sb:stop     # Stop Storybook
  npm run sb:status   # Show running instances
`);
}
