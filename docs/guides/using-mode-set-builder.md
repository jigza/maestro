# Using Mode Set Builder

This guide explains how to use the Mode Set Builder functionality to create and manage mode sets, ensuring that Maestro is only aware of the modes in its specific set.

## Overview

The Mode Set Builder functionality allows you to:

1. Create mode set-specific `.roomodes` files
2. Ensure Maestro is only aware of the modes in its specific set
3. Deploy different mode sets to different projects

This is achieved by:
- Creating Maestro-mode.md files with LLM instructions for each mode set
- Saving these files to a custom-sets directory as `Maestro-{modeset}.md` for reference
- Using these files to generate mode set-specific `.roomodes` files
- Using the mode set-specific `.roomodes` files when deploying to projects

## Available Mode Sets

The following mode sets are available:

### Individual Mode Sets
Each individual mode set includes the specific mode plus Maestro:
- accessibilityguardian
- apiarchitect
- artisan
- authguardian
- backendforge
- backendinspector
- blueprinter
- cloudforge
- codereviewer
- contentwriter
- dataarchitect
- deploymentmaster
- designsystemforge
- devsecops
- documentarian
- errormanager
- frontcrafter
- frontendinspector
- gitmaster
- infraplanner
- maestro
- modesetbuilder
- mobiledeveloper
- motiondesigner
- nodesmith
- nosqlsmith
- pathfinder
- performanceengineer
- planreviewer
- pythonmaster
- reactmaster
- researcher
- securitystrategist
- securitytester
- sqlmaster
- strategist
- testcrafter
- visionary

### Group Mode Sets
Group mode sets include multiple related modes:
- **core**: maestro, researcher, errormanager, modesetbuilder
- **frontend**: frontcrafter, reactmaster, frontendinspector, artisan, pathfinder, accessibilityguardian, maestro
- **backend**: backendforge, nodesmith, pythonmaster, backendinspector, apiarchitect, authguardian, maestro
- **data**: dataarchitect, sqlmaster, nosqlsmith, maestro
- **devops**: deploymentmaster, cloudforge, gitmaster, devsecops, maestro
- **design**: artisan, pathfinder, motiondesigner, designsystemforge, maestro
- **security**: securitystrategist, securitytester, authguardian, devsecops, maestro
- **planning**: visionary, strategist, blueprinter, planreviewer, maestro
- **testing**: testcrafter, securitytester, performanceengineer, maestro
- **all**: All available modes except modebuilder and modesetbuilder

## Using the Mode Set Builder

### Generating Mode Set-Specific .roomodes Files

To generate mode set-specific `.roomodes` files, use the `generate-mode-sets.js` script:

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

This will create `.roomodes-{mode-set}` files in the project root directory.

### Deploying Mode Sets to Projects

To deploy a specific mode set to a project, use the `copy_maestro.js` script with the `--mode-set` option:

```bash
# Deploy the frontend mode set to a project
node scripts/copy_maestro.js --mode-set frontend ../my-project

# Deploy the backend mode set to a project
node scripts/copy_maestro.js --mode-set backend ../my-project

# Dry run (show what would be copied without making changes)
node scripts/copy_maestro.js --dry-run --mode-set devops ../my-project
```

This will copy the mode set-specific `.roomodes` file to the target project as `.roomodes`.

## How It Works

The Mode Set Builder functionality works as follows:

1. The `generate-mode-sets.js` script:
   - Creates a temporary directory for processing
   - Creates a custom-sets directory if it doesn't exist
   - Creates a Maestro-mode.md file with LLM instructions for the specific mode set
   - Saves this file to both the temporary directory and the custom-sets directory as `Maestro-{mode-set}.md`
   - Copies the mode files for the modes in the set to the temporary directory
   - Runs the `generate-modes.js` script in the temporary directory to generate a `.roomodes` file
   - Copies the generated `.roomodes` file to the project root as `.roomodes-{mode-set}`
   - Cleans up the temporary directory while preserving the file in custom-sets

2. The `copy_maestro.js` script:
   - Checks if a mode set is specified with the `--mode-set` option
   - If a mode set is specified, it looks for a `.roomodes-{mode-set}` file
   - If the mode set-specific file exists, it uses that file instead of the default `.roomodes` file
   - Copies the selected `.roomodes` file to the target project as `.roomodes`

## Creating Custom Mode Sets

If you need to create custom mode sets beyond the predefined ones, you can modify the `modeset-config.yaml` file to add your custom mode sets. The file is structured as follows:

```yaml
# Mode Set Configuration
# This file defines all available mode sets for the Maestro project

# Individual mode sets (each includes itself + maestro)
individual_mode_sets:
  accessibilityguardian:
    - accessibilityguardian
    - maestro
  # ... other individual mode sets

# Group mode sets (all include maestro)
group_mode_sets:
  core:
    - maestro
    - researcher
    - errormanager
    - modesetbuilder
  # ... other group mode sets

# Special mode sets
special_mode_sets:
  all:
    - accessibilityguardian
    - apiarchitect
    # ... other modes
    # Note: 'all' explicitly includes all modes except modebuilder and modesetbuilder
```

To add a new mode set:
1. Decide whether it's an individual mode set, a group mode set, or a special mode set
2. Add it to the appropriate section in the `modeset-config.yaml` file
3. List the modes to include in the set
4. Regenerate the mode sets using the `generate-mode-sets.js` script

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

## Troubleshooting

### Mode Set-Specific .roomodes File Not Found

If you get a warning that a mode set-specific `.roomodes` file is not found, make sure you have generated the mode set first:

```bash
node scripts/generate-mode-sets.js --mode-set your-mode-set
```

### Errors During Generation

If you encounter errors during mode set generation, check the following:
- Make sure all mode files exist in the project root
- Ensure the Maestro-mode.md file contains a Mode Selection Criteria table
- Check for syntax errors in the mode files

## Best Practices

- Generate all mode sets before deploying to ensure you have the latest configurations
- Use the `--dry-run` option to preview changes before applying them
- Document which mode sets are used for which projects
- Consider using the `core` mode set as a minimum for most projects
- Add the ModeSetBuilder mode to projects that need to manage mode sets