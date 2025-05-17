# Updating a Single Mode

This guide explains how to update a specific mode within a mode set without regenerating the entire set.

## Overview

When developing or modifying modes, it's often necessary to update a single mode without regenerating all mode sets. The `generate-modes.js` script has been enhanced to support this functionality, allowing you to:

1. Update a specific mode in a specific mode set
2. Update a specific mode in all mode sets that include it

## Usage

### Command Line Arguments

The `generate-modes.js` script now accepts the following arguments:

- `--mode` or `-m`: Specify which mode to update (e.g., "backendforge", "frontcrafter")
- `--mode-set` or `-s`: Specify which mode set to update (e.g., "core", "frontend", "backend")
- `--dry-run` or `-d`: Show what would be updated without making changes
- `--help` or `-h`: Show help information

### Examples

#### Update a specific mode in all relevant mode sets

```bash
node generate-modes.js --mode backendforge
```

This command will:
1. Find all mode sets that include the "backendforge" mode
2. Update only the "backendforge" mode in each of those mode sets
3. Leave all other modes in those mode sets unchanged

#### Update a specific mode in a specific mode set

```bash
node generate-modes.js --mode backendforge --mode-set backend
```

This command will:
1. Update only the "backendforge" mode in the "backend" mode set
2. Leave all other modes in the "backend" mode set unchanged

#### Preview updates without making changes

```bash
node generate-modes.js --mode backendforge --dry-run
```

This command will show what would be updated without actually making any changes.

### Using npm Scripts

For convenience, the following npm scripts have been added:

```bash
# Update a specific mode in all relevant mode sets
npm run update-mode backendforge

# Preview updates without making changes
npm run update-mode:dry-run backendforge
```

## How It Works

The script performs the following steps:

1. Reads the specified mode markdown file to extract updated information
2. If a mode set is specified:
   - Reads the existing `.roomodes` file for that mode set
   - Updates only the specified mode in the configuration
   - Writes the updated configuration back to the file
3. If no mode set is specified:
   - Reads the `modeset-config.yaml` file to identify all mode sets that include the specified mode
   - Updates the mode in each relevant mode set

## Benefits

- **Efficiency**: No need to regenerate entire mode sets for small changes
- **Precision**: Only the specified mode is updated, reducing the risk of unintended changes
- **Flexibility**: Can update a mode in a specific mode set or across all relevant mode sets

## Notes

- The script preserves all other modes and their configurations in the `.roomodes` file
- The script provides feedback on which mode sets were updated
- If a mode is not found in a specified mode set, the script will skip that mode set and continue with others