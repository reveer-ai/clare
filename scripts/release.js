// Release step run by .github/workflows/release.yml on every push to main.
// Each step checks before it acts, so a push without a version bump does
// nothing and a rerun only finishes what is missing:
//   1. publish package.json's version to npm, unless it's already there
//      (refuse if it's lower than npm's latest),
//   2. create and push tag v<version> if it doesn't exist,
//   3. create the GitHub release for that tag if it doesn't exist.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAIN_SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const ANY_SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function parseVersion(v) {
  const m = String(v).match(ANY_SEMVER);
  if (!m) throw new Error(`can't compare against version "${v}": it isn't semver`);
  return { core: m.slice(1, 4).map(Number), pre: m[4] };
}

// Ours is always plain major.minor.patch, but npm's latest may carry a
// pre-release suffix (npm shows a 0.0.0-stage placeholder for a package
// that is still being created). Per semver, 1.0.0 is higher than 1.0.0-x.
export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) if (pa.core[i] !== pb.core[i]) return pa.core[i] - pb.core[i];
  if (pa.pre && !pb.pre) return -1;
  if (!pa.pre && pb.pre) return 1;
  return (pa.pre ?? '').localeCompare(pb.pre ?? '');
}

function describe(result) {
  return [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
}

function must(result, what) {
  if (result.status !== 0) throw new Error(`${what} failed (exit ${result.status}):\n${describe(result)}`);
  return result;
}

// { versions, latest } for the package, or null if it isn't on npm at all.
function npmInfo(run, name) {
  const result = run('npm', ['view', name, 'versions', 'dist-tags', '--json']);
  if (result.status !== 0) {
    let code;
    try {
      code = JSON.parse(result.stdout).error?.code;
    } catch {}
    if (code === 'E404') return null;
    throw new Error(`npm view ${name} failed (exit ${result.status}):\n${describe(result)}`);
  }
  const info = JSON.parse(result.stdout);
  return { versions: [].concat(info.versions ?? []), latest: info['dist-tags']?.latest };
}

export function release({ name, version, sha, run, log = console.log }) {
  if (!PLAIN_SEMVER.test(version)) {
    throw new Error(`version "${version}" isn't plain major.minor.patch; pre-release versions aren't supported`);
  }
  const tag = `v${version}`;

  const info = npmInfo(run, name);
  if (info?.versions.includes(version)) {
    log(`${name}@${version} is already on npm, so nothing is published.`);
  } else {
    if (info?.latest && compareVersions(version, info.latest) < 0) {
      throw new Error(
        `refusing to publish ${name}@${version}: it's lower than npm's latest, ${info.latest}, and publishing would move latest backwards`,
      );
    }
    log(`Publishing ${name}@${version}.`);
    must(run('npm', ['publish', '--provenance']), 'npm publish');
  }

  const remoteTag = run('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`]);
  if (remoteTag.status === 0) {
    log(`Tag ${tag} already exists.`);
  } else if (remoteTag.status === 2) {
    log(`Tagging ${sha} as ${tag}.`);
    must(run('git', ['tag', tag, sha]), `git tag ${tag}`);
    must(run('git', ['push', 'origin', `refs/tags/${tag}`]), `git push ${tag}`);
  } else {
    must(remoteTag, 'git ls-remote');
  }

  const existingRelease = run('gh', ['release', 'view', tag, '--json', 'tagName']);
  if (existingRelease.status === 0) {
    log(`GitHub release ${tag} already exists.`);
  } else if (/release not found/i.test(describe(existingRelease))) {
    log(`Creating GitHub release ${tag}.`);
    must(run('gh', ['release', 'create', tag, '--verify-tag', '--generate-notes', '--title', tag]), `gh release create ${tag}`);
  } else {
    must(existingRelease, `gh release view ${tag}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const sha = process.env.GITHUB_SHA;
  const run = (cmd, args) => {
    const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
    if (result.error) throw result.error;
    return result;
  };
  try {
    if (!sha) throw new Error('GITHUB_SHA is not set');
    release({ name: pkg.name, version: pkg.version, sha, run });
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
