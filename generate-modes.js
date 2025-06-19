#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const yaml = require('js-yaml');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);

// Parse command line arguments
const args = process.argv.slice(2);
let mode = null;
let modeSet = null;
let dryRun = false;
let help = false;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    help = true;
  } else if (arg === '--mode' || arg === '-m') {
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      mode = args[++i];
    } else {
      console.error('Error: --mode requires a value');
      process.exit(1);
    }
  } else if (arg === '--mode-set' || arg === '-s') {
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      modeSet = args[++i];
    } else {
      console.error('Error: --mode-set requires a value');
      process.exit(1);
    }
  } else if (arg === '--dry-run' || arg === '-d') {
    dryRun = true;
  }
}

// Show help if requested
if (help) {
  console.log(`
Usage: node generate-modes.js [options]

Options:
  --help, -h          Show this help message
  --mode, -m          Specify a mode to update (e.g., "backendforge", "frontcrafter")
  --mode-set, -s      Specify a mode set to update (e.g., "core", "frontend", "backend")
  --dry-run, -d       Show what would be updated without making changes

Examples:
  node generate-modes.js                                # Generate all modes
  node generate-modes.js --mode backendforge            # Update backendforge mode in all relevant mode sets
  node generate-modes.js --mode-set backend             # Regenerate the entire backend mode set
  node generate-modes.js --mode backendforge --mode-set backend  # Update only backendforge in the backend mode set
  node generate-modes.js --dry-run --mode backendforge  # Show what would be updated without making changes
  `);
  process.exit(0);
}

/**
 * Parses a mode markdown file to extract the mode name, role definition, and custom instructions
 * @param {string} content - The content of the markdown file
 * @returns {Object} An object containing the mode name, slug, role, and instructions
 */
function parseModeMd(content, filePath = 'unknown') {
  // Extract mode name from the first heading
  const nameMatch = content.match(/^# ([^\n]+) Mode/m);
  if (!nameMatch) {
    throw new Error(`Could not find mode name in markdown file: ${filePath}\nExpected format: "# ModeName Mode"`);
  }
  const name = nameMatch[1];
  
  // Generate slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  
  // Extract role definition
  const roleMatch = content.match(/## Role Definition\s+([^\n]+(?:\n(?!##)[^\n]+)*)/);
  if (!roleMatch) {
    throw new Error(`Could not find role definition in markdown file: ${filePath}\nExpected section: "## Role Definition"`);
  }
  const role = roleMatch[1].trim();
  
  // Extract custom instructions - capture everything after "## Custom Instructions" until the end of the file
  const instructionsMatch = content.match(/## Custom Instructions\s+([\s\S]+)$/);
  if (!instructionsMatch) {
    throw new Error(`Could not find custom instructions in markdown file: ${filePath}\nExpected section: "## Custom Instructions"`);
  }
  const instructions = instructionsMatch[1].trim();
  
  return {
    name,
    slug,
    role,
    instructions
  };
}

/**
 * Load mode sets from the configuration file
 * @returns {Object} The mode sets configuration
 */
async function loadModeSets() {
  try {
    const modeSetConfigPath = path.join(process.cwd(), 'modeset-config.yaml');
    
    // Check if the configuration file exists
    if (!await exists(modeSetConfigPath)) {
      console.error(`Error: Mode set configuration file not found at ${modeSetConfigPath}`);
      process.exit(1);
    }

    // Read and parse the YAML file
    const configContent = await readFile(modeSetConfigPath, 'utf8');
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

/**
 * Find all mode sets that include a specific mode
 * @param {Object} modeSets - The mode sets configuration
 * @param {string} targetMode - The mode to find
 * @returns {string[]} Array of mode set names that include the target mode
 */
function findModeSetsContainingMode(modeSets, targetMode) {
  const result = [];
  
  Object.entries(modeSets).forEach(([setName, modes]) => {
    if (modes.includes(targetMode)) {
      result.push(setName);
    }
  });
  
  return result;
}

/**
 * Read and parse a .roomodes file
 * @param {string} filePath - Path to the .roomodes file
 * @returns {Object} The parsed .roomodes configuration
 */
async function readRoomodesFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading .roomodes file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Update a specific mode in a .roomodes configuration
 * @param {Object} roomodesConfig - The .roomodes configuration
 * @param {Object} updatedMode - The updated mode object
 * @returns {Object} The updated .roomodes configuration
 */
function updateModeInConfig(roomodesConfig, updatedMode) {
  // Find the index of the mode to update
  const modeIndex = roomodesConfig.customModes.findIndex(m => m.slug === updatedMode.slug);
  
  if (modeIndex === -1) {
    // Mode not found in this configuration, return unchanged
    console.log(`Mode '${updatedMode.slug}' not found in this configuration, skipping update.`);
    return roomodesConfig;
  }
  
  // Update the mode
  roomodesConfig.customModes[modeIndex] = {
    ...roomodesConfig.customModes[modeIndex],
    name: updatedMode.name,
    roleDefinition: updatedMode.role,
    customInstructions: updatedMode.instructions
  };
  
  return roomodesConfig;
}

/**
 * Find the correct mode file path with proper capitalization
 * @param {string} modeName - The name of the mode to find
 * @returns {Promise<string|null>} The path to the mode file, or null if not found
 */
async function findModeFilePath(modeName) {
  // Try different capitalization patterns
  const possibleFileNames = [
    // Original capitalization as provided
    `${modeName}-mode.md`,
    // First letter uppercase, rest lowercase
    `${modeName.charAt(0).toUpperCase() + modeName.slice(1).toLowerCase()}-mode.md`,
    // All lowercase
    `${modeName.toLowerCase()}-mode.md`,
    // All uppercase first letter of each word
    `${modeName.split(/[-_\s]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('')}-mode.md`,
    // Try with "Mode" capitalized
    `${modeName.charAt(0).toUpperCase() + modeName.slice(1)}Mode-mode.md`,
    // Try with both first letters capitalized
    `${modeName.charAt(0).toUpperCase()}${modeName.charAt(1)}${modeName.slice(2)}-mode.md`
  ];
  
  // Also check for files in the directory
  const files = await readdir('.');
  const modeFiles = files.filter(file => file.toLowerCase().endsWith('-mode.md'));
  
  // Check for case-insensitive match
  for (const file of modeFiles) {
    const baseName = path.basename(file, '-mode.md').toLowerCase();
    if (baseName.toLowerCase() === modeName.toLowerCase() ||
        baseName.toLowerCase().replace(/[_\s-]/g, '') === modeName.toLowerCase().replace(/[_\s-]/g, '')) {
      return path.join(process.cwd(), file);
    }
  }
  
  // If no match found in directory scan, try the predefined patterns
  for (const fileName of possibleFileNames) {
    const filePath = path.join(process.cwd(), fileName);
    if (await exists(filePath)) {
      return filePath;
    }
  }
  
  console.log(`Debug: Could not find mode file for '${modeName}'. Tried patterns:`, possibleFileNames);
  console.log(`Debug: Available mode files:`, modeFiles);
  
  return null;
}

/**
 * Update a specific mode in a specific mode set
 * @param {string} modeName - The name of the mode to update
 * @param {string} modeSetName - The name of the mode set to update
 */
async function updateModeInModeSet(modeName, modeSetName) {
  try {
    // Find the mode file with proper capitalization
    const modeFilePath = await findModeFilePath(modeName);
    
    // Check if the mode file exists
    if (!modeFilePath) {
      console.error(`Error: Mode file not found for mode '${modeName}'`);
      return false;
    }
    
    // Path to the .roomodes file for the mode set
    const modeSetDir = path.join(process.cwd(), 'custom-sets', `${modeSetName}-agent`);
    const roomodesPath = path.join(modeSetDir, '.roomodes');
    
    // Check if the directory exists
    if (!await exists(modeSetDir)) {
      console.log(`Skipping mode set '${modeSetName}': directory not found at ${modeSetDir}`);
      
      // If this is an individual mode set, offer to create it
      const modeSets = await loadModeSets();
      if (modeSets[modeSetName] && modeSets[modeSetName].length <= 2) {
        console.log(`Note: '${modeSetName}' appears to be an individual mode set.`);
        console.log(`To create this mode set directory, run: mkdir -p custom-sets/${modeSetName}-agent`);
      }
      
      return false;
    }
    
    // Check if the .roomodes file exists
    if (!await exists(roomodesPath)) {
      console.log(`Skipping mode set '${modeSetName}': .roomodes file not found at ${roomodesPath}`);
      return false;
    }
    
    // Read and parse the mode file
    console.log(`Reading mode file: ${modeFilePath}`);
    const modeContent = await readFile(modeFilePath, 'utf-8');
    const parsedMode = parseModeMd(modeContent, modeFilePath);
    
    // Read and parse the .roomodes file
    console.log(`Reading .roomodes file: ${roomodesPath}`);
    const roomodesConfig = await readRoomodesFile(roomodesPath);
    
    // Update the mode in the configuration
    console.log(`Updating mode '${modeName}' in mode set '${modeSetName}'...`);
    const updatedConfig = updateModeInConfig(roomodesConfig, parsedMode);
    
    // Generate the updated configuration JSON
    const configJson = JSON.stringify(updatedConfig, null, 2);
    
    if (dryRun) {
      console.log(`[DRY RUN] Would update mode '${modeName}' in mode set '${modeSetName}'`);
      
      // Show a preview of the changes
      const originalMode = roomodesConfig.customModes.find(m => m.slug === parsedMode.slug);
      if (originalMode) {
        console.log(`  Changes to mode '${modeName}':`);
        if (originalMode.name !== parsedMode.name) {
          console.log(`  - Name: "${originalMode.name}" -> "${parsedMode.name}"`);
        }
        if (originalMode.roleDefinition !== parsedMode.role) {
          console.log(`  - Role Definition: Changed (${originalMode.roleDefinition.length} chars -> ${parsedMode.role.length} chars)`);
        }
        if (originalMode.customInstructions !== parsedMode.instructions) {
          console.log(`  - Custom Instructions: Changed (${originalMode.customInstructions.length} chars -> ${parsedMode.instructions.length} chars)`);
        }
      }
      
      return true;
    }
    
    // Write the updated configuration back to the file
    await writeFile(roomodesPath, configJson);
    
    console.log(`✓ Successfully updated mode '${modeName}' in mode set '${modeSetName}'`);
    return true;
  } catch (error) {
    console.error(`Error updating mode '${modeName}' in mode set '${modeSetName}':`, error);
    return false;
  }
}

/**
 * Main function to generate the .roomodes configuration file or update a specific mode
 */
async function generateModesConfig() {
  // Check for --global flag
  const isGlobal = process.argv.includes('--global');
  const outputFilename = isGlobal ? 'custom_modes.json' : '.roomodes';
  const sourceValue = isGlobal ? 'global' : 'project';

  try {
    // If a specific mode is provided
    if (mode) {
      // If a specific mode set is also provided
      if (modeSet) {
        // Update the specific mode in the specific mode set
        await updateModeInModeSet(mode, modeSet);
      } else {
        // Find all mode sets that include this mode
        const modeSets = await loadModeSets();
        const relevantModeSets = findModeSetsContainingMode(modeSets, mode);
        
        if (relevantModeSets.length === 0) {
          console.error(`Error: Mode '${mode}' not found in any mode set.`);
          console.error(`Available modes in config: ${Object.values(modeSets).flat().filter((v, i, a) => a.indexOf(v) === i).sort().join(', ')}`);
          process.exit(1);
        }
        
        console.log(`Found mode '${mode}' in ${relevantModeSets.length} mode sets: ${relevantModeSets.join(', ')}`);
        
        // Check which mode set directories actually exist
        const existingModeSets = [];
        const missingModeSets = [];
        
        for (const setName of relevantModeSets) {
          const modeSetDir = path.join(process.cwd(), 'custom-sets', `${setName}-agent`);
          if (await exists(modeSetDir)) {
            existingModeSets.push(setName);
          } else {
            missingModeSets.push(setName);
          }
        }
        
        if (missingModeSets.length > 0) {
          console.log(`Note: The following mode sets don't have directories: ${missingModeSets.join(', ')}`);
        }
        
        // Update the mode in all relevant mode sets
        let successCount = 0;
        for (const setName of relevantModeSets) {
          const success = await updateModeInModeSet(mode, setName);
          if (success) successCount++;
        }
        
        console.log(`Updated mode '${mode}' in ${successCount} of ${relevantModeSets.length} mode sets.`);
      }
    } else {
      // No specific mode provided, generate the full .roomodes configuration
      // Read all mode markdown files
      const files = await readdir('.');
      const modeFiles = files.filter(file => file.endsWith('-mode.md'));
      
      console.log(`Found ${modeFiles.length} mode files`);
      
      // Parse each mode file
      const modes = [];
      for (const file of modeFiles) {
        console.log(`Processing ${file}...`);
        const content = await readFile(file, 'utf-8');
        try {
          const mode = parseModeMd(content, file);
          
          // Add mode to the array
          modes.push({
            slug: mode.slug,
            name: mode.name,
            roleDefinition: mode.role,
            customInstructions: mode.instructions,
            groups: [
              "read",
              "edit",
              "browser",
              "command",
              "mcp"
            ],
            source: "project"
          });
        } catch (error) {
          console.error(`Error parsing ${file}: ${error.message}`);
        }
      }
      
      // Sort modes alphabetically by name
      modes.sort((a, b) => a.name.localeCompare(b.name));
      
      // Format the modes into the .roomodes configuration
      const roomodesConfig = {
        customModes: modes
      };
      
      // Generate the configuration JSON
      const configJson = JSON.stringify(roomodesConfig, null, 2);
      
      if (dryRun) {
        console.log(`[DRY RUN] Would generate .roomodes configuration with ${modes.length} modes`);
        console.log(`Mode slugs: ${modes.map(m => m.slug).join(', ')}`);
      } else {
        // Write the configuration to .roomodes file
        await writeFile('.roomodes', configJson);
        
        console.log(`Successfully generated .roomodes configuration with ${modes.length} modes`);
      }
    }
  } catch (error) {
    console.error('Error generating modes configuration:', error);
    process.exit(1);
  }
}

// Run the script
generateModesConfig().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
