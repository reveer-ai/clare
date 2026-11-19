# release Specification

## Purpose
Releases a new version of clare to npm automatically when a version bump reaches `main`, and records each release in git as a tag and a GitHub release.

## Requirements

### Requirement: Version source of truth
The `version` field in `package.json` on `main` SHALL be the only source of clare's version. The release process SHALL NOT commit to `main`.

#### Scenario: Release run
- **WHEN** a release run finishes
- **THEN** `main` has no new commits from it

### Requirement: Publish a new version on push to main
On every push to `main`, if the `package.json` version is not on npm, the release process SHALL run the tests and, if they pass, publish that version to npm as `latest` with provenance.

#### Scenario: Version bumped
- **GIVEN** `package.json` on `main` has version `0.2.0` and npm's latest is `0.1.0`
- **WHEN** that commit is pushed to `main`
- **THEN** `clare-ai@0.2.0` is published with a provenance attestation and becomes `latest`

#### Scenario: Tests fail
- **GIVEN** the version is not on npm and the tests fail
- **WHEN** the push to `main` runs
- **THEN** nothing is published, and the run fails

### Requirement: No release without a version bump
If the `package.json` version is already on npm, the push SHALL publish nothing.

#### Scenario: Record-only change
- **GIVEN** a push to `main` changes only `edda/` and leaves the version at one already on npm
- **WHEN** the release process runs
- **THEN** nothing is published, and the run succeeds

### Requirement: Never move latest backwards
The release process SHALL refuse to publish a version lower than npm's current `latest`, and fail the run.

#### Scenario: Lower version
- **GIVEN** npm's latest is `0.3.0` and `package.json` says `0.2.5`, which isn't on npm
- **WHEN** the push to `main` runs
- **THEN** nothing is published, `latest` stays `0.3.0`, and the run fails with a message naming both versions

### Requirement: Git tag and GitHub release per version
For each version on npm, the release process SHALL ensure that tag `v<version>` exists on the `main` commit that carried that version, and that a GitHub release with generated notes exists for that tag.

#### Scenario: After publishing
- **WHEN** `0.2.0` is published from a push to `main`
- **THEN** tag `v0.2.0` points at that commit, and a GitHub release `v0.2.0` exists

#### Scenario: Published earlier, tag missing
- **GIVEN** the version is already on npm but tag `v<version>` does not exist
- **WHEN** the push to `main` runs
- **THEN** the tag and release are created, and nothing is published

### Requirement: Safe to rerun
A rerun of a release run SHALL complete any step that is missing and repeat none that are done.

#### Scenario: Tagging failed after publish
- **GIVEN** a run published `0.2.0` but failed before creating the tag
- **WHEN** the run is rerun
- **THEN** it creates tag `v0.2.0` and the release without publishing again

### Requirement: Checks on pull requests
Every pull request SHALL run the tests and a dry-run pack of the package, without publishing, tagging or releasing.

#### Scenario: PR opened
- **WHEN** a pull request to `main` is opened or updated
- **THEN** the tests and a dry-run pack run and report a result, and nothing is published

### Requirement: No stored npm credentials
Publishing SHALL authenticate through npm trusted publishing from the repository's release workflow. No npm token SHALL be stored in the repository or its secrets.

#### Scenario: Repository secrets
- **WHEN** the repository's Actions secrets are listed
- **THEN** none of them is an npm token
