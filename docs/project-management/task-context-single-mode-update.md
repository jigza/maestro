# Task Context: Implement Single Mode Update for Mode Sets

## Task Information
- **Task ID**: single-mode-update-20250515
- **Jira Issue**: [MAES-2](https://agentience.atlassian.net/browse/MAES-2)
- **Description**: Implement a feature to update a specific mode within a mode set without regenerating the entire set
- **Assigned To**: BackendForge
- **Status**: To Do
- **Created**: 2025-05-15

## Background
Currently, when a mode file is updated, the entire mode set needs to be regenerated using the generate-mode-sets.js script. This is inefficient for minor changes to a single mode. The task involves updating the generate-modes.js file to accept a mode-set argument and update only the specified mode in the corresponding .roomodes file.

## Requirements
1. Modify the generate-modes.js file to accept a mode-set argument
2. Add functionality to update only the specified mode in the corresponding .roomodes file
3. Ensure the script can identify which mode set(s) contain the modified mode
4. Preserve all other modes in the .roomodes file
5. Update only the relevant parts of the .roomodes configuration

## Technical Details

### Current Implementation
- The `generate-modes.js` script:
  - Reads all mode markdown files in the current directory
  - Parses each file to extract mode information
  - Generates a `.roomodes` configuration file with all modes

- The `scripts/generate-mode-sets.js` script:
  - Creates mode set-specific `.roomodes` files
  - Creates directories under `custom-sets/{modeset_name}-agent/` for each mode set
  - Creates a customized `Maestro-mode.md` file for each mode set
  - Uses the modified file to generate a mode set-specific `.roomodes` file

- The `modeset-config.yaml` file:
  - Defines all available mode sets
  - Includes individual, group, and special mode sets

### Proposed Changes
1. Update `generate-modes.js` to accept new command-line arguments:
   - `--mode` or `-m`: Specify which mode to update
   - `--mode-set` or `-s`: Specify which mode set to update

2. Add logic to:
   - Read the existing `.roomodes` file for the specified mode set
   - Parse the specified mode markdown file
   - Update only that mode in the `.roomodes` configuration
   - Write the updated configuration back to the file

3. If only the mode is specified (without a mode set):
   - Read the `modeset-config.yaml` file
   - Identify all mode sets that include the specified mode
   - Update the mode in all relevant mode sets

## Acceptance Criteria
- [ ] The generate-modes.js script accepts a --mode parameter to specify which mode to update
- [ ] The script accepts a --mode-set parameter to specify which mode set to update
- [ ] When both parameters are provided, only the specified mode in the specified mode set is updated
- [ ] When only the mode parameter is provided, the script identifies all mode sets containing that mode and updates them
- [ ] The script preserves all other modes in the .roomodes file
- [ ] The script provides appropriate error handling and user feedback
- [ ] Documentation is updated to reflect the new functionality

## Dependencies
None

## Blockers
None

## Notes
- This enhancement will significantly improve the workflow for mode development and updates
- Consider adding a `--dry-run` option to show what would be updated without making changes
- Update the script's help text to document the new parameters