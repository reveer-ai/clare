import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = path.join(root, 'bin', 'clare.js');
const packagedSkill = path.join(root, 'skills', 'clare-explain');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function scratch(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clare-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function clare(cwd, ...args) {
  return spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' });
}

// Every file under dir, as relative path -> contents.
function snapshot(dir) {
  const files = {};
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    const full = path.join(entry.parentPath, entry.name);
    if (entry.isFile()) files[path.relative(dir, full)] = fs.readFileSync(full, 'utf8');
  }
  return files;
}

const canTestPermissions = process.platform !== 'win32' && process.getuid?.() !== 0;

// --- help, version, unknown commands ---

test('--help prints usage and exits 0', (t) => {
  const r = clare(scratch(t), '--help');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage: clare <command>/);
  assert.match(r.stdout, /init/);
});

test('--version prints the package version and exits 0', (t) => {
  const r = clare(scratch(t), '--version');
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), pkg.version);
});

test('no command prints usage and exits 1', (t) => {
  const r = clare(scratch(t));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Usage: clare <command>/);
});

test('unknown command prints usage, exits 1 and changes no files', (t) => {
  const dir = scratch(t);
  const r = clare(dir, 'frobnicate');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Unknown command: frobnicate/);
  assert.match(r.stderr, /Usage: clare <command>/);
  assert.deepEqual(fs.readdirSync(dir), []);
});

// --- init into .agents/skills ---

test('init in a fresh project installs the packaged skill and reports paths', (t) => {
  const dir = scratch(t);
  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(snapshot(path.join(dir, '.agents', 'skills', 'clare-explain')), snapshot(packagedSkill));
  assert.match(r.stdout, /installed\s+\.agents[/\\]skills[/\\]clare-explain/);
  assert.equal(r.stderr, '');
});

test('init leaves other entries in .agents/skills byte-for-byte unchanged', (t) => {
  const dir = scratch(t);
  const skills = path.join(dir, '.agents', 'skills');
  fs.mkdirSync(path.join(skills, 'openspec-explore'), { recursive: true });
  fs.writeFileSync(path.join(skills, 'openspec-explore', 'SKILL.md'), '---\nname: openspec-explore\n---\nexplore\n');
  fs.writeFileSync(path.join(skills, '.openspec-target'), 'agents\n');
  const before = snapshot(skills);

  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  const after = snapshot(skills);
  for (const [file, contents] of Object.entries(before)) assert.equal(after[file], contents, file);
  assert.deepEqual(
    fs.readdirSync(skills).sort(),
    ['.openspec-target', 'clare-explain', 'openspec-explore'],
  );
});

test('init replaces a stale or edited clare-explain skill with exactly the packaged files', (t) => {
  const dir = scratch(t);
  const installed = path.join(dir, '.agents', 'skills', 'clare-explain');
  fs.mkdirSync(installed, { recursive: true });
  fs.writeFileSync(path.join(installed, 'SKILL.md'), 'edited\n');
  fs.writeFileSync(path.join(installed, 'extra.md'), 'leftover\n');

  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(snapshot(installed), snapshot(packagedSkill));
  assert.match(r.stdout, /replaced\s+\.agents[/\\]skills[/\\]clare-explain/);
});

test('the installed skill uses only name and description', (t) => {
  const dir = scratch(t);
  clare(dir, 'init');
  const text = fs.readFileSync(path.join(dir, '.agents', 'skills', 'clare-explain', 'SKILL.md'), 'utf8');
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/)[1];
  const keys = frontmatter.split('\n').map((line) => line.split(':')[0]);
  assert.deepEqual(keys, ['name', 'description']);
  assert.match(frontmatter, /^name: clare-explain$/m);
});

// --- Claude Code link ---

test('with .claude/, init links .claude/skills/clare-explain to the .agents copy', (t) => {
  const dir = scratch(t);
  fs.mkdirSync(path.join(dir, '.claude'));
  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);

  const link = path.join(dir, '.claude', 'skills', 'clare-explain');
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  if (process.platform !== 'win32') {
    assert.equal(fs.readlinkSync(link), path.join('..', '..', '.agents', 'skills', 'clare-explain'));
  }
  assert.equal(
    fs.readFileSync(path.join(link, 'SKILL.md'), 'utf8'),
    fs.readFileSync(path.join(packagedSkill, 'SKILL.md'), 'utf8'),
  );
  assert.match(r.stdout, /linked\s+\.claude[/\\]skills[/\\]clare-explain -> \.\.\/\.\.\/\.agents\/skills\/clare-explain/);
});

test('without .claude/, init creates no .claude folder', (t) => {
  const dir = scratch(t);
  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(path.join(dir, '.claude')), false);
});

test('an existing symlink at .claude/skills/clare-explain is replaced', (t) => {
  const dir = scratch(t);
  const linkDir = path.join(dir, '.claude', 'skills');
  fs.mkdirSync(linkDir, { recursive: true });
  fs.mkdirSync(path.join(dir, 'elsewhere'));
  fs.symlinkSync(path.join(dir, 'elsewhere'), path.join(linkDir, 'clare-explain'), 'junction');

  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  const link = path.join(linkDir, 'clare-explain');
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  assert.equal(fs.realpathSync(link), fs.realpathSync(path.join(dir, '.agents', 'skills', 'clare-explain')));
  if (process.platform !== 'win32') {
    assert.equal(fs.readlinkSync(link), path.join('..', '..', '.agents', 'skills', 'clare-explain'));
  }
});

test('a real folder at .claude/skills/clare-explain is left alone with a warning', (t) => {
  const dir = scratch(t);
  const own = path.join(dir, '.claude', 'skills', 'clare-explain');
  fs.mkdirSync(own, { recursive: true });
  fs.writeFileSync(path.join(own, 'SKILL.md'), 'mine\n');

  const r = clare(dir, 'init');
  assert.equal(r.status, 0);
  assert.deepEqual(snapshot(own), { 'SKILL.md': 'mine\n' });
  assert.match(r.stderr, /warning: \.claude[/\\]skills[/\\]clare-explain already exists/);
  assert.deepEqual(snapshot(path.join(dir, '.agents', 'skills', 'clare-explain')), snapshot(packagedSkill));
});

test('a link that cannot be created warns and keeps the install', { skip: !canTestPermissions && 'needs POSIX permissions as non-root' }, (t) => {
  const dir = scratch(t);
  const linkDir = path.join(dir, '.claude', 'skills');
  fs.mkdirSync(linkDir, { recursive: true });
  fs.chmodSync(linkDir, 0o555);
  let r;
  try {
    r = clare(dir, 'init');
  } finally {
    fs.chmodSync(linkDir, 0o755);
  }
  assert.equal(r.status, 0);
  assert.match(r.stderr, /warning: couldn't link \.claude[/\\]skills[/\\]clare-explain/);
  assert.equal(fs.existsSync(path.join(linkDir, 'clare-explain')), false);
  assert.deepEqual(snapshot(path.join(dir, '.agents', 'skills', 'clare-explain')), snapshot(packagedSkill));
});

// --- retired skills ---

test('updating from 0.1.0 removes the placeholder skill and its link', (t) => {
  const dir = scratch(t);
  const old = path.join(dir, '.agents', 'skills', 'clare');
  fs.mkdirSync(old, { recursive: true });
  fs.writeFileSync(path.join(old, 'SKILL.md'), '---\nname: clare\n---\nTBD.\n');
  fs.mkdirSync(path.join(dir, '.claude', 'skills'), { recursive: true });
  fs.symlinkSync(path.join('..', '..', '.agents', 'skills', 'clare'), path.join(dir, '.claude', 'skills', 'clare'), 'dir');

  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(old), false);
  assert.throws(() => fs.lstatSync(path.join(dir, '.claude', 'skills', 'clare')), { code: 'ENOENT' });
  assert.match(r.stdout, /removed\s+\.agents[/\\]skills[/\\]clare\n/);
  assert.match(r.stdout, /removed\s+\.claude[/\\]skills[/\\]clare\n/);
  assert.deepEqual(snapshot(path.join(dir, '.agents', 'skills', 'clare-explain')), snapshot(packagedSkill));
});

test('a real folder named like a retired skill in .claude/skills is left alone', (t) => {
  const dir = scratch(t);
  const own = path.join(dir, '.claude', 'skills', 'clare');
  fs.mkdirSync(own, { recursive: true });
  fs.writeFileSync(path.join(own, 'SKILL.md'), 'mine\n');

  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(snapshot(own), { 'SKILL.md': 'mine\n' });
  assert.doesNotMatch(r.stdout, /removed/);
});

test('with no retired skill installed, nothing is reported as removed', (t) => {
  const dir = scratch(t);
  fs.mkdirSync(path.join(dir, '.claude'));
  const r = clare(dir, 'init');
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /removed/);
});
