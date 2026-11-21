# Spec Delta

## Purpose

Explains one subject by generating a single self-contained HTML page that gets it across with as little reading as possible.

## ADDED Requirements

### Requirement: Explain skill
The package SHALL ship a skill named `clare-explain` whose `SKILL.md` frontmatter has only the Agent Skills standard fields `name` and `description`. The description SHALL say that it explains a subject as a single visual HTML page and when to use it.

#### Scenario: Skill metadata
- **WHEN** the installed `.agents/skills/clare-explain/SKILL.md` is read
- **THEN** its frontmatter has `name: clare-explain` and a description of what it does and when to use it, with no other fields

### Requirement: Explicit subject
When the user gives a subject, the skill SHALL explain that subject.

#### Scenario: Subject given
- **WHEN** the user runs the skill with the subject "the release workflow"
- **THEN** the page explains the release workflow

### Requirement: Inferred subject only when confident
With no subject given, the skill SHALL infer one specific subject from the conversation only when the agent is confident which one the user means. Otherwise it SHALL ask the user what to explain. It SHALL NOT explain the whole session.

#### Scenario: Obvious subject
- **GIVEN** the conversation has just centered on one change
- **WHEN** the user runs the skill with no subject
- **THEN** the page explains that change

#### Scenario: Unclear subject
- **GIVEN** the conversation has covered several unrelated topics, or none
- **WHEN** the user runs the skill with no subject
- **THEN** the agent asks what to explain, offering its best guess if it has one, and writes no page until the user answers

#### Scenario: Never the whole session
- **GIVEN** a long conversation with several topics
- **WHEN** the user runs the skill with no subject
- **THEN** the agent does not produce a page that covers the whole session

### Requirement: Form left to the agent
The skill SHALL give the agent points to weigh when choosing how to present the subject, drawn from clare's principles. It SHALL NOT prescribe how to build the page or map kinds of subjects to forms.

#### Scenario: Skill text
- **WHEN** the skill's text is read
- **THEN** it contains no rule that assigns a form, layout or template to a kind of subject

### Requirement: Single self-contained HTML file
Each explanation SHALL be one HTML file with all styles, scripts and images inline, making no network requests, so it opens and works from disk.

#### Scenario: Opened offline
- **GIVEN** a generated page and no network connection
- **WHEN** the page is opened from disk in a browser
- **THEN** it displays and works fully, and requests nothing from the network

### Requirement: Page names what it explains
Each page SHALL show its subject and the sources it drew on, such as file paths or a commit, so a reader can check it.

#### Scenario: Subject and sources shown
- **WHEN** a page explaining code in the project is opened
- **THEN** it shows the subject and lists the files or commits it was based on

### Requirement: Page location
The skill SHALL write the page to `clare/<slug>.html` at the project root (the repository root, or the working directory outside a repository), creating `clare/` if needed. `<slug>` SHALL be a short kebab-case name for the subject. The skill SHALL NOT modify `.gitignore`.

#### Scenario: First page
- **GIVEN** a project with no `clare/` folder
- **WHEN** the skill explains "the auth flow"
- **THEN** a file such as `clare/auth-flow.html` exists at the project root, and `.gitignore` is unchanged

#### Scenario: Run from a subfolder
- **GIVEN** the agent is working in a subfolder of a git repository
- **WHEN** the skill writes a page
- **THEN** the page is in `clare/` at the repository root, not in the subfolder

#### Scenario: Same subject again
- **GIVEN** `clare/auth-flow.html` exists
- **WHEN** the skill explains the auth flow again
- **THEN** that file is replaced and no second file is created for it

### Requirement: Path reported
After writing a page, the skill SHALL tell the user its path.

#### Scenario: Page written
- **WHEN** the skill finishes writing a page
- **THEN** the agent tells the user the page's path
