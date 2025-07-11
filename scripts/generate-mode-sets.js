#!/usr/bin/env node

/**
 * Script to generate mode set-specific .roomodes files
 * 
 * This script:
 * 1. Creates a directory under custom-sets/{modeset_name}-agent/ for each mode set
 * 2. Creates a Maestro-mode.md file for each mode set in its directory
 * 3. Modifies the file to only include modes in the specific set
 * 4. Uses the modified file to generate a mode set-specific .roomodes file in the same directory
 * 5. Cleans up temporary files
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const mkdir = util.promisify(fs.mkdir);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);

// Path to the mode set configuration file
const modeSetConfigPath = path.join(process.cwd(), 'modeset-config.yaml');

// Parse command line arguments
const args = process.argv.slice(2);
let modeSet = null;
let dryRun = false;
let help = false;
let listSets = false;
let skipMaestroRecreation = false;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    help = true;
  } else if (arg === '--list-sets' || arg === '-l') {
    listSets = true;
  } else if (arg === '--mode-set' || arg === '-m') {
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      modeSet = args[++i];
    } else {
      console.error('Error: --mode-set requires a value');
      process.exit(1);
    }
  } else if (arg === '--dry-run' || arg === '-d') {
    dryRun = true;
  } else if (arg === '--skip-maestro' || arg === '-s') {
    skipMaestroRecreation = true;
  } else if (!arg.startsWith('-')) {
    // Positional argument for mode set
    modeSet = arg;
  }
}

// Show help if requested
if (help) {
  console.log(`
Usage: node generate-mode-sets.js [options] [mode-set]

Options:
  --help, -h          Show this help message
  --list-sets, -l     List available mode sets
  --mode-set, -m      Specify a mode set to generate (e.g., "core", "frontend", "backend")
  --dry-run, -d       Show what would be generated without making changes
  --skip-maestro, -s  Skip recreating the Maestro-mode.md file, use existing file

Examples:
  node generate-mode-sets.js --list-sets
  node generate-mode-sets.js frontend                # Same as --mode-set frontend
  node generate-mode-sets.js --mode-set frontend
  node generate-mode-sets.js --dry-run --mode-set backend
  node generate-mode-sets.js --mode-set frontend --skip-maestro
  node generate-mode-sets.js                         # Generate all mode sets
  `);
  process.exit(0);
}

/**
 * Load mode sets from the configuration file
 * @returns {Object} The mode sets configuration
 */
function loadModeSets() {
  try {
    // Check if the configuration file exists
    if (!fs.existsSync(modeSetConfigPath)) {
      console.error(`Error: Mode set configuration file not found at ${modeSetConfigPath}`);
      process.exit(1);
    }

    // Read and parse the YAML file
    const configContent = fs.readFileSync(modeSetConfigPath, 'utf8');
    const config = yaml.load(configContent);

    // Create a combined mode sets object
    const modeSets = {};

    // Add individual mode sets
    if (config.individual_mode_sets) {
      Object.entries(config.individual_mode_sets).forEach(([key, value]) => {
        modeSets[key] = value;
      });
    }

    // Add group mode sets
    if (config.group_mode_sets) {
      Object.entries(config.group_mode_sets).forEach(([key, value]) => {
        modeSets[key] = value;
      });
    }

    // Add special mode sets
    if (config.special_mode_sets) {
      Object.entries(config.special_mode_sets).forEach(([key, value]) => {
        modeSets[key] = value;
      });
    }

    return modeSets;
  } catch (error) {
    console.error(`Error loading mode set configuration: ${error.message}`);
    process.exit(1);
  }
}

// Load mode sets from the configuration file
const modeSets = loadModeSets();

// If list-sets flag is provided, list available mode sets and exit
if (listSets) {
  console.log('Available mode sets:');
  
  // Group mode sets by type
  const groupSets = Object.keys(modeSets).filter(set =>
    ['core', 'frontend', 'backend', 'data', 'devops', 'design', 'security', 'planning', 'testing', 'all'].includes(set)
  );
  
  const individualSets = Object.keys(modeSets).filter(set =>
    !groupSets.includes(set)
  );
  
  console.log('\nIndividual mode sets:');
  individualSets.forEach(set => {
    console.log(`  ${set}: ${modeSets[set].join(', ')}`);
  });
  
  console.log('\nGroup mode sets:');
  groupSets.forEach(set => {
    if (set === 'all') {
      console.log(`  ${set}: All modes`);
    } else {
      console.log(`  ${set}: ${modeSets[set].join(', ')}`);
    }
  });
  
  process.exit(0);
}

/**
 * Creates a Maestro mode file with instructions for the LLM to modify it for a specific mode set
 * @param {string} originalContent - The original content of the Maestro-mode.md file
 * @param {string[]} modesList - Array of mode slugs to include
 * @param {string} setName - The name of the mode set
 * @returns {string} The content with LLM instructions
 */
function createMaestroModeWithInstructions(originalContent, modesList, setName) {
  // Create a list of modes in the set with proper capitalization
  const modesListFormatted = modesList.map(mode =>
    mode === 'maestro' ? 'Maestro' : mode.charAt(0).toUpperCase() + mode.slice(1)
  ).join(', ');
  
  // Create instructions for the LLM
  const instructions = `
<!--
INSTRUCTIONS FOR LLM:
This is a modified version of the Maestro-mode.md file for the "${setName}" mode set.
The following modes are included in this set: ${modesListFormatted}.

You MUST modify the Mode Selection Criteria table to only include task types relevant to these modes.
For each task type, ensure that both Primary Modes and Secondary Modes only reference modes that are in this set.
If a task type's primary or secondary modes are not in this set, remove that entire row from the table.

${setName === 'frontend' ?
  'For this frontend-specific mode set, only include UI/UX design, frontend development, CSS/styling, accessibility, and frontend code review tasks.' :
  setName === 'backend' ?
  'For this backend-specific mode set, only include backend development, API, database, authentication, and backend code review tasks.' :
  'For this specialized mode set, include only the tasks relevant to the modes listed above.'}

Maintain all other Maestro functionality and instructions.
-->

`;

  // Add the instructions to the beginning of the file
  const contentWithInstructions = instructions + originalContent;
  
  console.log(`Created Maestro mode file with LLM instructions for the "${setName}" mode set.`);
  
  return contentWithInstructions;
}

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} dirPath - Path to the directory
 */
async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Generates a mode set-specific .roomodes file
 * @param {string} setName - The name of the mode set
 * @param {string[]} modes - Array of mode slugs in the set
 */
async function generateModeSet(setName, modes) {
  console.log(`Generating mode set: ${setName}`);
  
  try {
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    await ensureDirectoryExists(tempDir);
    
    // Create custom-sets directory if it doesn't exist
    const customSetsDir = path.join(process.cwd(), 'custom-sets');
    await ensureDirectoryExists(customSetsDir);
    
    // Create mode set directory if it doesn't exist
    const modeSetDir = path.join(customSetsDir, `${setName}-agent`);
    await ensureDirectoryExists(modeSetDir);
    
    // Path to original Maestro-mode.md file
    const originalMaestroPath = path.join(process.cwd(), 'Maestro-mode.md');
    
    // Path to temporary Maestro-mode.md file
    const tempMaestroPath = path.join(tempDir, 'Maestro-mode.md');
    
    // Path to custom Maestro-mode.md file in mode set directory
    const customMaestroPath = path.join(modeSetDir, 'Maestro-mode.md');
    
    // Path to output .roomodes file in mode set directory
    const outputRoomodesPath = path.join(modeSetDir, '.roomodes');
    
    let tempMaestroContent;
    
    if (skipMaestroRecreation && fs.existsSync(customMaestroPath)) {
      // Use existing Maestro-mode.md file from mode set directory
      console.log(`Using existing Maestro-mode.md file from ${modeSetDir}`);
      tempMaestroContent = await readFile(customMaestroPath, 'utf-8');
    } else {
      // Read original Maestro-mode.md content
      const originalContent = await readFile(originalMaestroPath, 'utf-8');
      
      // Create content with LLM instructions
      tempMaestroContent = createMaestroModeWithInstructions(originalContent, modes, setName);
    }
    
    if (dryRun) {
      console.log(`[DRY RUN] Would create temporary Maestro-mode.md file at: ${tempMaestroPath}`);
      if (!skipMaestroRecreation) {
        console.log(`[DRY RUN] Would create custom Maestro-mode.md file at: ${customMaestroPath}`);
      }
      console.log(`[DRY RUN] Would generate .roomodes file at: ${outputRoomodesPath}`);
    } else {
      // Write content to temporary file
      await writeFile(tempMaestroPath, tempMaestroContent, 'utf-8');
      console.log(`Created temporary Maestro-mode.md file at: ${tempMaestroPath}`);
      
      // Write content to mode set directory if not skipping recreation
      if (!skipMaestroRecreation) {
        await writeFile(customMaestroPath, tempMaestroContent, 'utf-8');
        console.log(`Created custom Maestro-mode.md file at: ${customMaestroPath}`);
      }
      
      // Copy all mode files to temp directory
      for (const mode of modes) {
        if (mode === 'maestro') continue; // Skip maestro as we've already created a custom version
        
        const modeFilePath = path.join(process.cwd(), `${mode.charAt(0).toUpperCase() + mode.slice(1)}-mode.md`);
        const tempModeFilePath = path.join(tempDir, `${mode.charAt(0).toUpperCase() + mode.slice(1)}-mode.md`);
        
        if (fs.existsSync(modeFilePath)) {
          await copyFile(modeFilePath, tempModeFilePath);
          console.log(`Copied ${modeFilePath} to ${tempModeFilePath}`);
        } else {
          console.warn(`Warning: Mode file not found: ${modeFilePath}`);
        }
      }
      
      // Generate .roomodes file using the temporary directory
      console.log(`Generating .roomodes file for mode set: ${setName}`);
      // Use the original generate-modes.js but set the working directory to the temp directory
      const generateModesPath = path.join(process.cwd(), 'generate-modes.js');
      
      // Execute generate-modes.js with the temp directory as the working directory
      // Use absolute paths to avoid module resolution issues
      execSync(`node "${generateModesPath}"`, {
        cwd: tempDir,
        env: {
          ...process.env,
          NODE_PATH: process.cwd() // Set NODE_PATH to include the original directory
        }
      });
      
      
      // Check if the .roomodes file was created in the temp directory
      const tempRoomodesPath = path.join(tempDir, '.roomodes');
      if (await exists(tempRoomodesPath)) {
        console.log(`Found .roomodes file in temp directory: ${tempRoomodesPath}`);
        
        // Copy the generated .roomodes file to the output path in the mode set directory
        try {
          await copyFile(tempRoomodesPath, outputRoomodesPath);
          console.log(`✓ Generated .roomodes file for mode set ${setName} at: ${outputRoomodesPath}`);
        } catch (error) {
          console.error(`Error copying .roomodes file: ${error.message}`);
          
          // Try to list files in the temp directory
          try {
            const tempFiles = await readdir(tempDir);
            console.log(`Files in temp directory: ${tempFiles.join(', ')}`);
          } catch (e) {
            console.error(`Error listing temp directory: ${e.message}`);
          }
        }
      } else {
        console.error(`Error: .roomodes file not found in temp directory: ${tempRoomodesPath}`);
        
        // Try to list files in the temp directory
        try {
          const tempFiles = await readdir(tempDir);
          console.log(`Files in temp directory: ${tempFiles.join(', ')}`);
        } catch (e) {
          console.error(`Error listing temp directory: ${e.message}`);
        }
      }
      
      console.log(`✓ Saved Maestro mode file for mode set ${setName} at: ${customMaestroPath}`);
      
      // For backward compatibility during transition, also copy to legacy paths
      // This can be removed once all scripts are updated to use the new paths
      // const legacyRoomodesPath = path.join(process.cwd(), `.roomodes-${setName}`);
      // await copyFile(tempRoomodesPath, legacyRoomodesPath);
      // console.log(`✓ Also copied to legacy path for backward compatibility: ${legacyRoomodesPath}`);

      // Clean up temporary files
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`Cleaned up temporary directory: ${tempDir}`);
    }
  } catch (error) {
    console.error(`Error generating mode set ${setName}:`, error);
  }
}

/**
 * Main function to generate mode sets
 */
async function main() {
  try {
    // If a specific mode set is specified, generate only that set
    if (modeSet) {
      const setName = modeSet.toLowerCase();
      
      if (!modeSets[setName]) {
        console.error(`Error: Unknown mode set "${modeSet}". Use --list-sets to see available sets.`);
        process.exit(1);
      }
      
      let modes = modeSets[setName];
      
      // No special handling needed for 'all' mode set anymore as it's explicitly defined in the YAML file
      
      await generateModeSet(setName, modes);
    } else {
      // Generate all mode sets
      console.log('Generating all mode sets...');
      
      // Get all set names excluding individual mode sets
      const setNames = ['core', 'frontend', 'backend', 'data', 'devops', 'design', 'security', 'planning', 'testing', 'all'];
      
      for (const setName of setNames) {
        let modes = modeSets[setName];
        
        // No special handling needed for 'all' mode set anymore as it's explicitly defined in the YAML file
        
        await generateModeSet(setName, modes);
      }
    }
    
    console.log('\nMode set generation completed successfully!');
    console.log('\nNOTE: The mode sets are now generated in a directory structure:');
    console.log('custom-sets/{modeset_name}-agent/');
    console.log('with the following files in each directory:');
    console.log('- Maestro-mode.md');
    console.log('- .roomodes');
  } catch (error) {
    console.error('Error generating mode sets:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});