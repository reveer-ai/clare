import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = path.join(root, 'skills');
const names = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

test('the package ships at least one skill', () => {
  assert.ok(names.length > 0);
});

for (const name of names) {
  test(`${name}: frontmatter has only name and description, and name matches the folder`, () => {
    const text = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
    const match = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(match, 'SKILL.md starts with a frontmatter block');

    const fields = Object.fromEntries(
      match[1].split('\n').map((line) => {
        const colon = line.indexOf(':');
        assert.ok(colon > 0, `frontmatter line is a key: value pair: ${line}`);
        return [line.slice(0, colon), line.slice(colon + 1).trim()];
      }),
    );
    assert.deepEqual(Object.keys(fields), ['name', 'description']);
    assert.equal(fields.name, name);
    assert.ok(fields.description.length > 0, 'description is not empty');
  });
}
