# Spec Delta

## MODIFIED Requirements

### Requirement: Install skills into .agents/skills
`clare init` SHALL install each of clare's skills into `.agents/skills/<name>/` under the current working directory, creating `.agents/skills/` if it does not exist.

#### Scenario: Fresh project
- **WHEN** `clare init` runs in a directory with no `.agents/` folder
- **THEN** `.agents/skills/clare-explain/SKILL.md` exists and matches the packaged skill

#### Scenario: Paths reported
- **WHEN** `clare init` finishes
- **THEN** it prints each path it wrote and exits 0

### Requirement: Rerun replaces clare's skills
Running `clare init` again SHALL replace each of clare's skill folders with the packaged version, so the result matches the package exactly.

#### Scenario: Stale or edited skill
- **GIVEN** `.agents/skills/clare-explain/` has edited content and an extra file
- **WHEN** `clare init` runs
- **THEN** `.agents/skills/clare-explain/` holds exactly the packaged files

### Requirement: Link for Claude Code
When `.claude/` exists in the current directory, `clare init` SHALL make `.claude/skills/<name>` a relative symlink to `../../.agents/skills/<name>` for each clare skill, creating `.claude/skills/` if needed. Without `.claude/`, it SHALL NOT create one.

#### Scenario: Project uses Claude Code
- **GIVEN** the directory has a `.claude/` folder
- **WHEN** `clare init` runs
- **THEN** `.claude/skills/clare-explain` is a symlink whose target is `../../.agents/skills/clare-explain`, and reading `.claude/skills/clare-explain/SKILL.md` gives the packaged skill

#### Scenario: Project doesn't use Claude Code
- **GIVEN** the directory has no `.claude/` folder
- **WHEN** `clare init` runs
- **THEN** no `.claude/` folder exists afterwards

#### Scenario: Existing link
- **GIVEN** `.claude/skills/clare-explain` is already a symlink
- **WHEN** `clare init` runs
- **THEN** it is replaced with a symlink to `../../.agents/skills/clare-explain`

### Requirement: Never overwrite a real folder at the link path
If `.claude/skills/<name>` exists and is not a symlink, `clare init` SHALL leave it unchanged, print a warning naming it, still complete the `.agents/skills/` install, and exit 0.

#### Scenario: User's own folder in the way
- **GIVEN** `.claude/skills/clare-explain/` is a real folder
- **WHEN** `clare init` runs
- **THEN** that folder is unchanged, a warning names it, `.agents/skills/clare-explain/` is installed, and the exit code is 0

### Requirement: Link failure does not fail the install
If the link cannot be created, `clare init` SHALL print a warning, keep the `.agents/skills/` install, and exit 0.

#### Scenario: Symlink not permitted
- **GIVEN** `.claude/` exists and the filesystem refuses to create the link
- **WHEN** `clare init` runs
- **THEN** a warning explains the link was not created, and `.agents/skills/clare-explain/` is installed

## ADDED Requirements

### Requirement: Remove retired skills
`clare init` SHALL remove `.agents/skills/<name>/` for each skill clare used to ship and no longer does, and `.claude/skills/<name>` when it is a symlink, printing each path it removed. A real folder at `.claude/skills/<name>` SHALL be left unchanged.

#### Scenario: Updating from 0.1.0
- **GIVEN** `.agents/skills/clare/` exists and `.claude/skills/clare` is a symlink to it
- **WHEN** `clare init` runs
- **THEN** neither exists afterwards, both paths are printed as removed, and `.agents/skills/clare-explain/` is installed

#### Scenario: Real folder named like a retired skill
- **GIVEN** `.claude/skills/clare/` is a real folder
- **WHEN** `clare init` runs
- **THEN** that folder is unchanged

#### Scenario: Nothing retired present
- **GIVEN** no retired skill is installed
- **WHEN** `clare init` runs
- **THEN** nothing is reported as removed

## REMOVED Requirements

### Requirement: Placeholder skill
**Reason**: Replaced by the `clare-explain` skill, specified in the `explain` capability.
**Migration**: Run `npx clare-ai@latest init`, which removes the placeholder and installs `clare-explain`.
