# Spec Delta

## Purpose

Puts clare's skills into a project so the coding assistants working in it can use them, without touching anything that isn't clare's.

## ADDED Requirements

### Requirement: Command name and invocation
The package `clare-ai` SHALL provide a command named `clare`, runnable without a global install through `npx clare-ai <command>`.

#### Scenario: Run through npx
- **WHEN** a user runs `npx clare-ai init` in a project
- **THEN** clare's `init` command runs in that project

#### Scenario: Run when installed
- **WHEN** `clare-ai` is installed and a user runs `clare init`
- **THEN** clare's `init` command runs in the current directory

### Requirement: Help, version and unknown commands
`clare --help` and `clare --version` SHALL print usage and the package version and exit 0. With no command or an unknown one, `clare` SHALL print usage and exit 1.

#### Scenario: Version
- **WHEN** a user runs `clare --version`
- **THEN** it prints the installed package version and exits 0

#### Scenario: Unknown command
- **WHEN** a user runs `clare frobnicate`
- **THEN** it prints usage and exits 1 without changing any files

### Requirement: Install skills into .agents/skills
`clare init` SHALL install each of clare's skills into `.agents/skills/<name>/` under the current working directory, creating `.agents/skills/` if it does not exist.

#### Scenario: Fresh project
- **WHEN** `clare init` runs in a directory with no `.agents/` folder
- **THEN** `.agents/skills/clare/SKILL.md` exists and matches the packaged skill

#### Scenario: Paths reported
- **WHEN** `clare init` finishes
- **THEN** it prints each path it wrote and exits 0

### Requirement: Leave other skills untouched
`clare init` SHALL NOT modify, remove or read any entry in `.agents/skills/` other than clare's own skill folders.

#### Scenario: Other skills present
- **GIVEN** `.agents/skills/` holds another tool's skill folders and files, such as `openspec-explore/` and `.openspec-target`
- **WHEN** `clare init` runs
- **THEN** those entries are byte-for-byte unchanged

### Requirement: Rerun replaces clare's skills
Running `clare init` again SHALL replace each of clare's skill folders with the packaged version, so the result matches the package exactly.

#### Scenario: Stale or edited skill
- **GIVEN** `.agents/skills/clare/` has edited content and an extra file
- **WHEN** `clare init` runs
- **THEN** `.agents/skills/clare/` holds exactly the packaged files

### Requirement: Link for Claude Code
When `.claude/` exists in the current directory, `clare init` SHALL make `.claude/skills/<name>` a relative symlink to `../../.agents/skills/<name>` for each clare skill, creating `.claude/skills/` if needed. Without `.claude/`, it SHALL NOT create one.

#### Scenario: Project uses Claude Code
- **GIVEN** the directory has a `.claude/` folder
- **WHEN** `clare init` runs
- **THEN** `.claude/skills/clare` is a symlink whose target is `../../.agents/skills/clare`, and reading `.claude/skills/clare/SKILL.md` gives the packaged skill

#### Scenario: Project doesn't use Claude Code
- **GIVEN** the directory has no `.claude/` folder
- **WHEN** `clare init` runs
- **THEN** no `.claude/` folder exists afterwards

#### Scenario: Existing link
- **GIVEN** `.claude/skills/clare` is already a symlink
- **WHEN** `clare init` runs
- **THEN** it is replaced with a symlink to `../../.agents/skills/clare`

### Requirement: Never overwrite a real folder at the link path
If `.claude/skills/<name>` exists and is not a symlink, `clare init` SHALL leave it unchanged, print a warning naming it, still complete the `.agents/skills/` install, and exit 0.

#### Scenario: User's own folder in the way
- **GIVEN** `.claude/skills/clare/` is a real folder
- **WHEN** `clare init` runs
- **THEN** that folder is unchanged, a warning names it, `.agents/skills/clare/` is installed, and the exit code is 0

### Requirement: Link failure does not fail the install
If the link cannot be created, `clare init` SHALL print a warning, keep the `.agents/skills/` install, and exit 0.

#### Scenario: Symlink not permitted
- **GIVEN** `.claude/` exists and the filesystem refuses to create the link
- **WHEN** `clare init` runs
- **THEN** a warning explains the link was not created, and `.agents/skills/clare/` is installed

### Requirement: Placeholder skill
The package SHALL ship one skill, `clare`, whose `SKILL.md` uses only the Agent Skills standard fields: `name: clare` and a description stating it is TBD and does nothing.

#### Scenario: Skill metadata
- **WHEN** the installed `.agents/skills/clare/SKILL.md` is read
- **THEN** its frontmatter has `name: clare` and a description stating the skill is a TBD placeholder that does nothing, with no other fields
