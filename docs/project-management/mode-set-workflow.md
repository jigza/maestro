# Mode Set Workflow

This document outlines the workflow for creating and managing mode sets using the Mode Set Builder functionality.

## Overview

The Mode Set Builder functionality allows you to create and manage mode sets, ensuring that Maestro is only aware of the modes in its specific set. This is achieved through a combination of scripts and processes that generate mode set-specific configuration files.

## Workflow

### 1. Define Mode Sets

Mode sets are defined in the `scripts/generate-mode-sets.js` script. Each mode set is a collection of modes that work together for a specific purpose or domain.

There are two types of mode sets:
- **Individual Mode Sets**: Each mode plus Maestro (e.g., `accessibilityguardian`, `apiarchitect`)
- **Group Mode Sets**: Collections of related modes (e.g., `frontend`, `backend`, `security`)

### 2. Generate Mode Set-Specific .roomodes Files

Use the `generate-mode-sets.js` script to generate mode set-specific `.roomodes` files:

```bash
# Generate all mode sets
npm run generate-mode-sets

# Generate a specific mode set
npm run generate-mode-sets:frontend
```

This process:
1. Creates a temporary directory
2. Creates a temporary Maestro-mode.md file that only includes modes from the specific set
3. Copies the mode files for the modes in the set to the temporary directory
4. Runs the `generate-modes.js` script in the temporary directory to generate a `.roomodes` file
5. Copies the generated `.roomodes` file to the project root as `.roomodes-{mode-set}`
6. Cleans up the temporary directory

### 3. Deploy Mode Sets to Projects

Use the `copy_maestro.js` script with the `--mode-set` option to deploy a specific mode set to a project:

```bash
# Deploy the frontend mode set to a project
npm run copy-maestro:frontend -- ../my-project
```

This process:
1. Checks for a `.roomodes-{mode-set}` file
2. If found, uses that file instead of the default `.roomodes` file
3. Copies the selected `.roomodes` file to the target project as `.roomodes`
4. Copies other required files (`.roo` directory, `docs` directory)

### 4. Maintain Mode Sets

When adding new modes or modifying existing ones:

1. Update the mode definitions in the appropriate mode files
2. Regenerate the mode sets using the `generate-mode-sets.js` script
3. Update the mode set definitions in `scripts/generate-mode-sets.js` if necessary
4. Redeploy the updated mode sets to projects

## Mode Set Definitions

Mode sets are defined in the `modeset-config.yaml` file:

```yaml
# Mode Set Configuration
# This file defines all available mode sets for the Maestro project

# Individual mode sets (each includes itself + maestro)
individual_mode_sets:
  accessibilityguardian:
    - accessibilityguardian
    - maestro
  apiarchitect:
    - apiarchitect
    - maestro
  # ...

# Group mode sets (all include maestro)
group_mode_sets:
  core:
    - maestro
    - researcher
    - errormanager
    - modesetbuilder
  frontend:
    - frontcrafter
    - reactmaster
    - frontendinspector
    - artisan
    - pathfinder
    - accessibilityguardian
    - maestro
  # ...

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
4. Regenerate the mode sets

## Mode Awareness

The key feature of this system is ensuring that Maestro is only aware of the modes in its specific set. This is achieved by modifying the Mode Selection Criteria table in the Maestro-mode.md file to only include modes from the specific set.

For example, in the `frontend` mode set, Maestro will only be aware of:
- FrontCrafter
- ReactMaster
- FrontendInspector
- Artisan
- Pathfinder
- AccessibilityGuardian

This ensures that Maestro only delegates tasks to modes that are available in the specific deployment.

## Best Practices

- Generate all mode sets before deploying to ensure you have the latest configurations
- Use the `--dry-run` option to preview changes before applying them
- Document which mode sets are used for which projects
- Consider using the `core` mode set as a minimum for most projects
- Add the ModeSetBuilder mode to projects that need to manage mode sets
- When adding new modes, update all relevant mode sets
- Regularly test mode sets to ensure they work as expected

## Troubleshooting

### Mode Set-Specific .roomodes File Not Found

If you get a warning that a mode set-specific `.roomodes` file is not found, make sure you have generated the mode set first:

```bash
npm run generate-mode-sets:your-mode-set
```

### Errors During Generation

If you encounter errors during mode set generation, check the following:
- Make sure all mode files exist in the project root
- Ensure the Maestro-mode.md file contains a Mode Selection Criteria table
- Check for syntax errors in the mode files

### Maestro Not Delegating to Expected Modes

If Maestro is not delegating to expected modes:
- Verify that the mode is included in the mode set
- Check that the mode is properly referenced in the Mode Selection Criteria table
- Regenerate the mode set and redeploy to the project