#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagedSkills = path.join(packageRoot, 'skills');

const usage = `Usage: clare <command>

Commands:
  init         Install clare's skills into this project's .agents/skills/
               (and link them into .claude/skills/ if .claude/ exists)

Options:
  --help       Show this help
  --version    Show the installed version
`;

function version() {
  return JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version;
}

function warn(message) {
  process.stderr.write(`warning: ${message}\n`);
}

// Point .claude/skills/<name> at the .agents/skills/<name> copy, so Claude Code
// finds the same files. Never fails the install: problems become warnings.
function linkForClaudeCode(cwd, name) {
  const linkDir = path.join(cwd, '.claude', 'skills');
  const linkPath = path.join(linkDir, name);
  const shown = path.join('.claude', 'skills', name);
  const target = path.join('..', '..', '.agents', 'skills', name);

  try {
    fs.mkdirSync(linkDir, { recursive: true });

    let existing = null;
    try {
      existing = fs.lstatSync(linkPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (existing && !existing.isSymbolicLink()) {
      warn(`${shown} already exists and isn't a link, so it was left alone. Claude Code won't see clare's ${name} skill.`);
      return;
    }
    if (existing) fs.unlinkSync(linkPath);

    if (process.platform === 'win32') {
      // Junctions need no admin rights, but they must use an absolute target.
      fs.symlinkSync(path.resolve(linkDir, target), linkPath, 'junction');
    } else {
      fs.symlinkSync(target, linkPath, 'dir');
    }
    console.log(`linked     ${shown} -> ${target.split(path.sep).join('/')}`);
  } catch (error) {
    warn(`couldn't link ${shown} (${error.code ?? error.message}). The skill is installed in .agents/skills/, but Claude Code won't see it.`);
  }
}

function init(cwd) {
  const skillsDir = path.join(cwd, '.agents', 'skills');
  const names = fs
    .readdirSync(packagedSkills, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const useClaude = fs.existsSync(path.join(cwd, '.claude'));

  fs.mkdirSync(skillsDir, { recursive: true });
  for (const name of names) {
    const dest = path.join(skillsDir, name);
    const replacing = fs.existsSync(dest);
    // Replace clare's own folder outright; nothing else in .agents/skills/ is touched.
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(path.join(packagedSkills, name), dest, { recursive: true });
    console.log(`${replacing ? 'replaced ' : 'installed'}  ${path.join('.agents', 'skills', name)}`);

    if (useClaude) linkForClaudeCode(cwd, name);
  }
}

const args = process.argv.slice(2);

if (args.length === 1 && args[0] === '--help') {
  process.stdout.write(usage);
} else if (args.length === 1 && args[0] === '--version') {
  console.log(version());
} else if (args.length === 1 && args[0] === 'init') {
  init(process.cwd());
} else {
  if (args.length > 0) process.stderr.write(`Unknown command: ${args.join(' ')}\n\n`);
  process.stderr.write(usage);
  process.exitCode = 1;
}
