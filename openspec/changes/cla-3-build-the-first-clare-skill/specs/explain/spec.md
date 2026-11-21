# Spec Delta

## Purpose

Explains one subject by generating a single self-contained HTML page that gets it across as effectively and efficiently as possible.

## ADDED Requirements

### Requirement: Explain skill
The package SHALL ship a skill named `clare` whose `SKILL.md` frontmatter has only the Agent Skills standard fields `name` and `description`. The description SHALL say that it gets a subject across as a single visual HTML page, and when to use it.

#### Scenario: Skill metadata
- **WHEN** the installed `.agents/skills/clare/SKILL.md` is read
- **THEN** its frontmatter has `name: clare` and a description of what it does and when to use it, with no other fields

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

### Requirement: Page checked before hand-over
Before handing a page over, the agent SHALL check it: its content is true to its sources, it reaches nothing on the network, and it renders with its interactive parts working. If the agent could not check something, it SHALL say so.

#### Scenario: Page checked
- **WHEN** the agent has written a page
- **THEN** it checks the page before telling the user it's ready

#### Scenario: Check not possible
- **GIVEN** the agent has no way to render the page
- **WHEN** it hands the page over
- **THEN** it says the page wasn't rendered

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

### Requirement: Page opened and path reported
After writing and checking a page, the agent SHALL open it with the operating system's open command when it can run commands, and SHALL tell the user its path either way.

#### Scenario: Agent can run commands
- **WHEN** the page is ready and the agent can run shell commands
- **THEN** it opens the page with the OS's open command (`open`, `xdg-open` or `start`) and tells the user the path

#### Scenario: Opening not possible
- **GIVEN** the agent can't run commands, or the open command fails
- **WHEN** the page is ready
- **THEN** the agent tells the user the path

### Requirement: Brief with the user
What the agent says to the user while using the skill SHALL follow clare's principles: as few words as possible, with the main point first. The final report SHALL NOT restate the page.

#### Scenario: Final report
- **WHEN** the page is ready
- **THEN** the agent's message gives the path and at most a line or two more, such as anything it couldn't check

#### Scenario: Asking about the subject
- **WHEN** the agent needs to ask what to explain
- **THEN** it asks one short question
