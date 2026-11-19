import { test } from 'node:test';
import assert from 'node:assert/strict';
import { release, compareVersions } from '../scripts/release.js';

const SHA = 'abc123';
const notFound = JSON.stringify({ error: { code: 'E404', summary: 'Not Found' } });

// A stand-in for npm, git and gh. `state` says what already exists; every
// call is recorded so tests can check what the release step did.
function fake({ npm = null, tags = [], releases = [], fail = {} } = {}) {
  const calls = [];
  const run = (cmd, args) => {
    const line = [cmd, ...args].join(' ');
    calls.push(line);
    if (fail[line]) return { status: 1, stdout: '', stderr: fail[line] };
    if (line.startsWith('npm view')) {
      if (!npm) return { status: 1, stdout: notFound, stderr: 'npm error code E404' };
      return { status: 0, stdout: JSON.stringify({ versions: npm.versions, 'dist-tags': { latest: npm.latest } }), stderr: '' };
    }
    if (line.startsWith('git ls-remote')) {
      const tag = args.at(-1).replace('refs/tags/', '');
      return tags.includes(tag) ? { status: 0, stdout: `${SHA}\trefs/tags/${tag}\n`, stderr: '' } : { status: 2, stdout: '', stderr: '' };
    }
    if (line.startsWith('gh release view')) {
      return releases.includes(args[2]) ? { status: 0, stdout: '{}', stderr: '' } : { status: 1, stdout: '', stderr: 'release not found' };
    }
    return { status: 0, stdout: '', stderr: '' };
  };
  return { run, calls, did: (prefix) => calls.filter((c) => c.startsWith(prefix)) };
}

const go = (f, version) => release({ name: 'clareai', version, sha: SHA, run: f.run, log: () => {} });

test('version bumped: publishes, tags the commit and creates the release', () => {
  const f = fake({ npm: { versions: ['0.0.1', '0.1.0'], latest: '0.1.0' }, tags: ['v0.1.0'], releases: ['v0.1.0'] });
  go(f, '0.2.0');
  assert.deepEqual(f.did('npm publish'), ['npm publish --provenance']);
  assert.deepEqual(f.did('git tag'), [`git tag v0.2.0 ${SHA}`]);
  assert.deepEqual(f.did('git push'), ['git push origin refs/tags/v0.2.0']);
  assert.deepEqual(f.did('gh release create'), ['gh release create v0.2.0 --verify-tag --generate-notes --title v0.2.0']);
});

test('package not on npm yet: publishes', () => {
  const f = fake();
  go(f, '0.1.0');
  assert.equal(f.did('npm publish').length, 1);
});

test('version unchanged (record-only push): does nothing and succeeds', () => {
  const f = fake({ npm: { versions: ['0.1.0'], latest: '0.1.0' }, tags: ['v0.1.0'], releases: ['v0.1.0'] });
  go(f, '0.1.0');
  assert.deepEqual(f.did('npm publish'), []);
  assert.deepEqual(f.did('git tag'), []);
  assert.deepEqual(f.did('git push'), []);
  assert.deepEqual(f.did('gh release create'), []);
});

test('lower than latest: refuses, names both versions, publishes nothing', () => {
  const f = fake({ npm: { versions: ['0.3.0'], latest: '0.3.0' } });
  assert.throws(() => go(f, '0.2.5'), /0\.2\.5.*0\.3\.0/);
  assert.deepEqual(f.did('npm publish'), []);
  assert.deepEqual(f.did('git tag'), []);
});

test('published earlier, tag missing: tags and releases without publishing', () => {
  const f = fake({ npm: { versions: ['0.2.0'], latest: '0.2.0' } });
  go(f, '0.2.0');
  assert.deepEqual(f.did('npm publish'), []);
  assert.deepEqual(f.did('git tag'), [`git tag v0.2.0 ${SHA}`]);
  assert.equal(f.did('gh release create').length, 1);
});

test('rerun after the tag was pushed but the release failed: only creates the release', () => {
  const f = fake({ npm: { versions: ['0.2.0'], latest: '0.2.0' }, tags: ['v0.2.0'] });
  go(f, '0.2.0');
  assert.deepEqual(f.did('npm publish'), []);
  assert.deepEqual(f.did('git tag'), []);
  assert.equal(f.did('gh release create').length, 1);
});

test('a failed publish stops before tagging', () => {
  const f = fake({ npm: { versions: ['0.1.0'], latest: '0.1.0' }, fail: { 'npm publish --provenance': 'ENEEDAUTH' } });
  assert.throws(() => go(f, '0.2.0'), /npm publish failed[\s\S]*ENEEDAUTH/);
  assert.deepEqual(f.did('git tag'), []);
});

test('an npm error other than 404 fails the run', () => {
  const f = fake({ fail: { 'npm view clareai versions dist-tags --json': 'ETIMEDOUT' } });
  assert.throws(() => go(f, '0.2.0'), /npm view clareai failed/);
  assert.deepEqual(f.did('npm publish'), []);
});

test('pre-release versions are refused', () => {
  assert.throws(() => go(fake(), '0.2.0-beta.1'), /pre-release/);
});

test('compareVersions orders numerically', () => {
  assert.ok(compareVersions('0.10.0', '0.9.9') > 0);
  assert.ok(compareVersions('0.2.5', '0.3.0') < 0);
  assert.equal(compareVersions('1.2.3', '1.2.3'), 0);
});

test('compareVersions ranks a release above its pre-releases', () => {
  assert.ok(compareVersions('0.1.0', '0.0.0-stage') > 0);
  assert.ok(compareVersions('1.0.0', '1.0.0-beta.1') > 0);
  assert.ok(compareVersions('0.9.0', '1.0.0-beta.1') < 0);
});

test("npm's placeholder latest (0.0.0-stage) doesn't block the first release", () => {
  const f = fake({ npm: { versions: ['0.0.0-stage'], latest: '0.0.0-stage' } });
  go(f, '0.1.0');
  assert.deepEqual(f.did('npm publish'), ['npm publish --provenance']);
});

test('a latest that isn\'t semver fails the run instead of crashing', () => {
  const f = fake({ npm: { versions: ['weird'], latest: 'weird' } });
  assert.throws(() => go(f, '0.1.0'), /isn't semver/);
  assert.deepEqual(f.did('npm publish'), []);
});
