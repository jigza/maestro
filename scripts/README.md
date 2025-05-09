# Maestro Scripts

This directory contains utility scripts for the Maestro project.

## Contents

- [copy_maestro.js](#maestro-copy-utility) - Copy Maestro files to a target directory
- [generate-mode-sets.js](#mode-set-generator) - Generate mode set-specific .roomodes files
- [add_error_protocol.py](#add-error-protocol) - Add error protocol to mode files

# Maestro Copy Utility

The `copy_maestro.js` script copies essential Maestro project files to a target directory.

## What Gets Copied

- `.roo` directory → `{target}/.roo`
- `docs` directory → `{target}/docs` (excluding `docs/guides`)
- Mode definitions from `.roomodes` → `{target}/.roomodes`

## Usage

You can run the script using npm:

```bash
npm run copy-maestro [options] <target_directory>
```

Or directly:

```bash
node scripts/copy_maestro.js [options] <target_directory>
```

### Options

- `--help`, `-h`: Show help message
- `--playback`, `-p`: Specify a custom playback file (playback is always enabled by default)
- `--mode-set`, `-m`: Specify a mode set to copy (e.g., "core", "frontend", "backend")
- `--dry-run`, `-d`: Show what would be copied without making changes

## Mode Sets

The script supports copying specific sets of modes:

### Individual Mode Sets

Each mode has its own set that includes the mode itself plus maestro:

- `accessibilityguardian`: AccessibilityGuardian + Maestro
- `apiarchitect`: ApiArchitect + Maestro
- `artisan`: Artisan + Maestro
- `authguardian`: AuthGuardian + Maestro
- `backendforge`: BackendForge + Maestro
- `backendinspector`: BackendInspector + Maestro
- `blueprinter`: Blueprinter + Maestro
- `cloudforge`: CloudForge + Maestro
- `codereviewer`: CodeReviewer + Maestro
- `contentwriter`: ContentWriter + Maestro
- `dataarchitect`: DataArchitect + Maestro
- `deploymentmaster`: DeploymentMaster + Maestro
- `designsystemforge`: DesignSystemForge + Maestro
- `devsecops`: DevSecOps + Maestro
- `documentarian`: Documentarian + Maestro
- `errormanager`: ErrorManager + Maestro
- `frontcrafter`: FrontCrafter + Maestro
- `frontendinspector`: FrontendInspector + Maestro
- `gitmaster`: GitMaster + Maestro
- `infraplanner`: InfraPlanner + Maestro
- `maestro`: Maestro only
- `mobiledeveloper`: MobileDeveloper + Maestro
- `motiondesigner`: MotionDesigner + Maestro
- `nodesmith`: NodeSmith + Maestro
- `nosqlsmith`: NoSqlSmith + Maestro
- `pathfinder`: Pathfinder + Maestro
- `performanceengineer`: PerformanceEngineer + Maestro
- `planreviewer`: PlanReviewer + Maestro
- `pythonmaster`: PythonMaster + Maestro
- `reactmaster`: ReactMaster + Maestro
- `researcher`: Researcher + Maestro
- `securitystrategist`: SecurityStrategist + Maestro
- `securitytester`: SecurityTester + Maestro
- `sqlmaster`: SqlMaster + Maestro
- `strategist`: Strategist + Maestro
- `testcrafter`: TestCrafter + Maestro
- `visionary`: Visionary + Maestro

### Group Mode Sets

- `core`: Essential orchestration modes (Maestro, Researcher, ErrorManager)
- `frontend`: Frontend development modes (FrontCrafter, ReactMaster, FrontendInspector, etc.)
- `backend`: Backend development modes (BackendForge, NodeSmith, PythonMaster, etc.)
- `data`: Database-related modes (DataArchitect, SqlMaster, NoSqlSmith)
- `devops`: DevOps and deployment modes (DeploymentMaster, CloudForge, GitMaster, etc.)
- `design`: Design-related modes (Artisan, Pathfinder, MotionDesigner, etc.)
- `security`: Security-focused modes (SecurityStrategist, SecurityTester, etc.)
- `planning`: Planning and architecture modes (Visionary, Strategist, Blueprinter, etc.)
- `testing`: Testing-related modes (TestCrafter, SecurityTester, PerformanceEngineer)
- `all`: All available modes (default)

Note: Maestro mode is included in all mode sets.

## Playback

The playback feature automatically records all operations performed during a copy and saves them to a JSON file. This can be used to:

1. Audit what changes were made
2. Replay the same operations in another environment
3. Automate repetitive copy operations

A file named `copy_maestro_playback.json` is always created in the current directory after each copy operation (unless using dry-run mode).

### Viewing Playback Information

You can view information about the last copy operation by running the script without a target directory:

```bash
npm run copy-maestro
# or
node scripts/copy_maestro.js
```

This will display:
- Timestamp of the last operation
- Original command that was executed
- Target directory used
- Number of actions performed
- Instructions for replaying the operation

## Behavior

- If the target directory doesn't exist, it will be created
- If the target already has these directories, the script will add to them, not replace them
- For `.roomodes`, the script will merge mode definitions, avoiding duplicates based on the mode slug

## Examples

```bash
# Copy to a new project
npm run copy-maestro ../my-new-project

# Copy only frontend modes
npm run copy-maestro --mode-set frontend ../my-new-project

# Dry run to see what would be copied without making changes
npm run copy-maestro --dry-run ../my-new-project

# Copy with explicit playback file
npm run copy-maestro --playback custom-playback.json ../my-new-project

# Copy core modes with dry run
npm run copy-maestro -m core -d ../my-new-project

# View information about the last copy operation
npm run copy-maestro
```

# Mode Set Generator

The `generate-mode-sets.js` script generates mode set-specific `.roomodes` files by creating temporary Maestro-mode.md files that only include modes from the specific set. It reads mode set definitions from the `modeset-config.yaml` file in the project root.

## What It Does

- Creates a Maestro-mode.md file with LLM instructions for each mode set
- Saves this file to a custom-sets directory as `Maestro-{mode-set}.md` for reference
- Uses the file to generate a mode set-specific `.roomodes` file
- Preserves the custom Maestro-mode.md files for future reference

## Usage

You can run the script using:

```bash
node scripts/generate-mode-sets.js [options]
```

### Options

- `--help`, `-h`: Show help message
- `--list-sets`, `-l`: List available mode sets
- `--mode-set`, `-m`: Specify a mode set to generate (e.g., "core", "frontend", "backend")
- `--dry-run`, `-d`: Show what would be generated without making changes

## Examples

```bash
# List available mode sets
node scripts/generate-mode-sets.js --list-sets

# Generate a specific mode set
node scripts/generate-mode-sets.js --mode-set frontend

# Generate all mode sets
node scripts/generate-mode-sets.js

# Dry run (show what would be generated without making changes)
node scripts/generate-mode-sets.js --dry-run --mode-set backend
```

## Viewing Mode Set Configurations

After generating mode sets, you can find the Maestro-mode.md files for each mode set in the `custom-sets` directory:

```
custom-sets/
  Maestro-frontend.md
  Maestro-backend.md
  Maestro-core.md
  ...
```

These files contain the original Maestro-mode.md content with LLM instructions at the top. The instructions tell the LLM how to modify the Mode Selection Criteria table to only include task types relevant to the modes in the set.

### How ModeSetBuilder Uses These Files

When the ModeSetBuilder mode is activated, it MUST:

1. Use the Maestro-{modeset}.md files in the custom-sets directory as its starting point
2. Read and follow the "INSTRUCTIONS FOR LLM:" section at the top of these files
3. Modify the Mode Selection Criteria table according to these instructions
4. Ensure that only modes in the specified set are referenced in the table
5. Remove rows for task types that don't apply to the modes in the set

This process ensures that each mode set has a properly filtered version of the Maestro mode that only includes the relevant tasks and modes.

## Mode Set Configuration

Mode sets are defined in the `modeset-config.yaml` file in the project root. This file contains three sections:

1. `individual_mode_sets`: Each mode plus Maestro (e.g., `accessibilityguardian`, `apiarchitect`)
2. `group_mode_sets`: Collections of related modes (e.g., `frontend`, `backend`, `security`)
3. `special_mode_sets`: Special mode sets like `all` (which includes all modes)

To add a new mode set, edit the `modeset-config.yaml` file and add your mode set to the appropriate section.

## Integration with copy_maestro.js

After generating mode set-specific `.roomodes` files, you can use the `copy_maestro.js` script with the `--mode-set` option to deploy a specific mode set to a project:

```bash
# Generate the frontend mode set
node scripts/generate-mode-sets.js --mode-set frontend

# Deploy the frontend mode set to a project
node scripts/copy_maestro.js --mode-set frontend ../my-project
```

Both scripts read from the same `modeset-config.yaml` file, ensuring consistency in mode set definitions.

For more detailed information, see the [Using Mode Set Builder](../docs/guides/using-mode-set-builder.md) guide.

# Add Error Protocol

The `add_error_protocol.py` script adds error protocol to mode files.