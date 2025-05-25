#!/usr/bin/env node

/**
 * Script to copy Maestro project files to a target directory
 * - Copies .roo directory
 * - Copies docs directory (excluding guides)
 * - Selectively copies mode definitions from .roomodes
 * 
 * Updated to use the new mode set directory structure:
 * - custom-sets/{modeset_name}-agent/
 *   - Maestro-mode.md
 *   - .roomodes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const minimatch = require('minimatch');

// Path to the mode set configuration file
const modeSetConfigPath = path.join(process.cwd(), 'modeset-config.yaml');
// Path to the copyignore file
const copyignorePath = path.join(process.cwd(), '.copyignore');

// Store ignore patterns
let ignorePatterns = [];

/**
 * Load ignore patterns from .copyignore file
 * @returns {Array} Array of ignore patterns
 */
function loadIgnorePatterns() {
  try {
    if (fs.existsSync(copyignorePath)) {
      const content = fs.readFileSync(copyignorePath, 'utf8');
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    }
  } catch (error) {
    console.error(`Error loading .copyignore file: ${error.message}`);
  }
  return [];
}

/**
 * Check if a path should be ignored based on .copyignore patterns
 * @param {string} filePath - Path to check (relative to source directory)
 * @returns {boolean} True if the path should be ignored
 */
function shouldIgnore(filePath) {
  // Make path relative to source directory for matching
  const relativePath = path.relative(sourceDir, filePath);
  
  for (const pattern of ignorePatterns) {
    if (minimatch(relativePath, pattern) ||
        relativePath.startsWith(pattern) ||
        relativePath === pattern) {
      return true;
    }
  }
  return false;
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

// Parse command line arguments
const args = process.argv.slice(2);
let targetDir = null;
let playbackMode = false;
let playbackFile = null;
let modeSet = null;
let dryRun = false;
let help = false;
let skipExisting = false;
let listMode = false;

// Store original command for playback
const originalCommand = process.argv.slice(1).join(' ');

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    help = true;
  } else if (arg === '--list') {
    listMode = true;
  } else if (arg === '--playback' || arg === '-p') {
    playbackMode = true;
    // Don't consume the next argument as playbackFile
    // The next non-flag argument will be treated as targetDir
  } else if (arg === '--mode-set' || arg === '-m') {
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      modeSet = args[++i];
    } else {
      console.error('Error: --mode-set requires a value');
      process.exit(1);
    }
  } else if (arg === '--dry-run' || arg === '-d') {
    dryRun = true;
  } else if (arg === '--skip-existing' || arg === '-s') {
    skipExisting = true;
  } else if (!arg.startsWith('-')) {
    targetDir = arg;
  }
}

// If no target directory is provided, default to playback mode
if (!targetDir && !help) {
  playbackMode = true;
  console.log('No target directory provided, defaulting to playback mode');
}

// Show help if requested
if (help) {
  console.log(`
Usage: node copy_maestro.js [options] <target_directory>

Options:
  --help, -h          Show this help message
  --playback, -p      Enable playback mode to execute saved commands
                       - Without target: Executes all saved commands sequentially
                       - With target: Executes the saved command for that target
  --list              When used with --playback, lists all available targets
                       Example: node copy_maestro.js --playback --list
  --mode-set, -m      Specify a mode set to copy (e.g., "core", "frontend", "backend")
                       Note: Mode sets are automatically regenerated if needed
  --dry-run, -d       Show what would be copied without making changes
  --skip-existing, -s Skip existing modes instead of overwriting them (default: overwrite)

Examples:
  node copy_maestro.js ../my-project                # Copy to a target directory
  node copy_maestro.js --mode-set aws ../my-project # Copy AWS mode set to target
  node copy_maestro.js --dry-run ../my-project      # Dry run without changes
  node copy_maestro.js --playback                   # Execute all saved commands
  node copy_maestro.js --playback --list            # List all saved targets
  node copy_maestro.js --playback ../my-project     # Execute saved command for target
  `);
  process.exit(0);
}

// If in playback mode without a target directory, just show playback info and exit
// Handle playback mode
if (playbackMode) {
  const playbackFilePath = path.join(process.cwd(), 'copy_maestro_playback.json');
  
  if (!fs.existsSync(playbackFilePath)) {
    console.error(`Error: Playback file not found at ${playbackFilePath}`);
    process.exit(1);
  }
  
  try {
    // Load and potentially migrate the playback data
    const fileContent = fs.readFileSync(playbackFilePath, 'utf8');
    let loadedPlaybackData = JSON.parse(fileContent);
    
    // Check if the playback file is in the old format
    if (loadedPlaybackData.timestamp && loadedPlaybackData.command && loadedPlaybackData.target) {
      console.log('Migrating playback file from old format to new format...');
      
      // Convert old format to new format
      loadedPlaybackData = {
        [loadedPlaybackData.target]: {
          timestamp: loadedPlaybackData.timestamp,
          command: loadedPlaybackData.command
        }
      };
      
      // Save the migrated format back to the file
      fs.writeFileSync(playbackFilePath, JSON.stringify(loadedPlaybackData, null, 2), 'utf8');
      console.log(`Migrated entry for target: ${Object.keys(loadedPlaybackData)[0]}`);
    }
    
    if (!targetDir) {
      // Check if we should list targets instead of executing
      if (listMode) {
        // Display playback information
        console.log('\nPlayback file information:');
        console.log(`- Total targets: ${Object.keys(loadedPlaybackData).length}`);
        
        Object.entries(loadedPlaybackData).forEach(([target, data]) => {
          console.log(`\nTarget: ${target}`);
          console.log(`- Last updated: ${data.timestamp}`);
          console.log(`- Command: ${data.command}`);
        });
        
        console.log('\nTo replay all operations, run:');
        console.log(`node scripts/copy_maestro.js --playback`);
        console.log('\nTo replay a specific target, run:');
        console.log(`node scripts/copy_maestro.js --playback <target_directory>`);
        
        process.exit(0);
      } else {
        // Execute all playback commands by default
        console.log('\nExecuting all playback commands:');
        
        // Execute each command in sequence
        for (const [target, data] of Object.entries(loadedPlaybackData)) {
          console.log(`\n--- Executing for target: ${target} ---`);
          
          const commandParts = data.command.split(' ');
          const scriptIndex = commandParts.findIndex(part => part.includes('copy_maestro.js'));
          
          if (scriptIndex !== -1) {
            // Create a new command that uses node to execute the script
            const args = commandParts.slice(scriptIndex + 1).join(' ');
            const execCommand = `node scripts/copy_maestro.js ${args}`;
            console.log(`Modified command: ${execCommand}`);
            
            try {
              execSync(execCommand, { stdio: 'inherit' });
              console.log(`✓ Command executed successfully for target: ${target}`);
            } catch (err) {
              console.error(`✗ Error executing command for target ${target}: ${err.message}`);
              // Continue with next command even if this one fails
            }
          } else {
            console.error(`✗ Could not parse command for target ${target}`);
          }
        }
        
        console.log('\nAll playback commands executed.');
        process.exit(0);
      }
    } else {
      // Execute playback for specific target
      if (loadedPlaybackData[targetDir]) {
        const targetCommand = loadedPlaybackData[targetDir].command;
        console.log(`Executing playback command for target ${targetDir}:`);
        console.log(`> ${targetCommand}`);
        
        try {
          const { execSync } = require('child_process');
          
          // Extract the arguments from the original command
          const commandParts = targetCommand.split(' ');
          const scriptIndex = commandParts.findIndex(part => part.includes('copy_maestro.js'));
          
          if (scriptIndex !== -1) {
            // Create a new command that uses node to execute the script
            const args = commandParts.slice(scriptIndex + 1).join(' ');
            const execCommand = `node scripts/copy_maestro.js ${args}`;
            console.log(`Modified command: ${execCommand}`);
            
            execSync(execCommand, { stdio: 'inherit' });
          } else {
            // If we can't find the script in the command, just execute it as is
            execSync(targetCommand, { stdio: 'inherit' });
          }
          
          console.log(`\nPlayback executed successfully for target: ${targetDir}`);
        } catch (err) {
          console.error(`Error executing playback command: ${err.message}`);
          process.exit(1);
        }
      } else {
        console.error(`Error: No playback data found for target: ${targetDir}`);
        console.log('Available targets:');
        Object.keys(loadedPlaybackData).forEach(target => console.log(`- ${target}`));
        process.exit(1);
      }
      
      process.exit(0);
    }
  } catch (err) {
    console.error(`Error reading playback file: ${err.message}`);
    process.exit(1);
  }
}

// Load existing playback data or create new structure
let playbackData = {};
const playbackFilePath = path.join(process.cwd(), 'copy_maestro_playback.json');

// Try to load existing playback data
if (fs.existsSync(playbackFilePath)) {
  try {
    const fileContent = fs.readFileSync(playbackFilePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    
    // Check if the playback file is in the old format (has timestamp, command, target, actions as top-level keys)
    if (parsedData.timestamp && parsedData.command && parsedData.target) {
      console.log('Migrating playback file from old format to new format...');
      
      // Convert old format to new format
      playbackData = {
        [parsedData.target]: {
          timestamp: parsedData.timestamp,
          command: parsedData.command
        }
      };
      
      console.log(`Migrated entry for target: ${parsedData.target}`);
    } else {
      // Already in new format
      playbackData = parsedData;
    }
  } catch (err) {
    console.warn(`Warning: Could not parse existing playback file: ${err.message}`);
    playbackData = {};
  }
}

// Current operation for playback
const currentOperation = {
  timestamp: new Date().toISOString(),
  command: originalCommand
};

// Resolve paths
const sourceDir = process.cwd();
const targetPath = path.resolve(targetDir);

// Load ignore patterns
ignorePatterns = loadIgnorePatterns();
if (ignorePatterns.length > 0) {
  console.log(`Loaded ${ignorePatterns.length} ignore patterns from .copyignore`);
}

console.log(`Copying Maestro files from ${sourceDir} to ${targetPath}`);

// Create target directory if it doesn't exist and not in dry run mode
if (!fs.existsSync(targetPath) && !dryRun) {
  fs.mkdirSync(targetPath, { recursive: true });
  console.log(`Created target directory: ${targetPath}`);
  // No need to track individual actions anymore
} else if (!fs.existsSync(targetPath)) {
  console.log(`[DRY RUN] Would create target directory: ${targetPath}`);
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
    return true;
  }
  return false;
}

/**
 * Copy a directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {Function} filter - Optional filter function to exclude files/directories
 */
function copyDirectory(src, dest, filter = () => true) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip if filtered out or should be ignored based on .copyignore
    if (!filter(srcPath, entry) || shouldIgnore(srcPath)) {
      if (shouldIgnore(srcPath)) {
        console.log(`  Skipping ignored path: ${path.relative(sourceDir, srcPath)}`);
      }
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDirectory(srcPath, destPath, filter);
    } else {
      // Copy file if not in dry run mode
      if (!dryRun) {
        fs.copyFileSync(srcPath, destPath);
        // No need to track individual file copies
      } else {
        console.log(`[DRY RUN] Would copy file: ${srcPath} -> ${destPath}`);
      }
    }
  }
}

/**
 * Copy .roo directory
 */
function copyRooDirectory() {
  const srcRooDir = path.join(sourceDir, '.roo');
  const destRooDir = path.join(targetPath, '.roo');

  if (!fs.existsSync(srcRooDir)) {
    console.log('Warning: .roo directory not found in source');
    return;
  }

  console.log(`${dryRun ? '[DRY RUN] Would copy' : 'Copying'} .roo directory to ${destRooDir}`);
  copyDirectory(srcRooDir, destRooDir);
  
  if (!dryRun) {
    console.log('✓ .roo directory copied successfully');
    // No need to track directory copy action
  }
}

/**
 * Copy docs directory (excluding guides)
 */
function copyDocsDirectory() {
  const srcDocsDir = path.join(sourceDir, 'docs');
  const destDocsDir = path.join(targetPath, 'docs');

  if (!fs.existsSync(srcDocsDir)) {
    console.log('Warning: docs directory not found in source');
    return;
  }

  console.log(`${dryRun ? '[DRY RUN] Would copy' : 'Copying'} docs directory to ${destDocsDir} (excluding guides)`);
  
  // Filter function to exclude guides directory
  const docsFilter = (srcPath, entry) => {
    if (entry.isDirectory() && entry.name === 'guides') {
      console.log('  Skipping guides directory');
      return false;
    }
    return true;
  };

  copyDirectory(srcDocsDir, destDocsDir, docsFilter);
  
  if (!dryRun) {
    console.log('✓ docs directory copied successfully (excluding guides)');
    // No need to track filtered directory copy action
  }
}

/**
 * Copy .roomodes file for a specific mode set
 * @param {string} setName - The name of the mode set
 * @param {boolean} regenerated - Whether mode sets were regenerated
 */
function copyRoomodes(setName, regenerated = false) {
  // Determine source .roomodes file path based on mode set
  let srcRoomodesPath;
  
  if (setName) {
    // Use mode set-specific .roomodes file from the new directory structure
    const modeSetDir = path.join(sourceDir, 'custom-sets', `${setName}-agent`);
    srcRoomodesPath = path.join(modeSetDir, '.roomodes');
    
    // For backwards compatibility, check for the old path format
    const legacyRoomodesPath = path.join(sourceDir, `.roomodes-${setName}`);
    
    if (fs.existsSync(srcRoomodesPath)) {
      console.log(`Using mode set .roomodes file from "${setName}-agent" directory`);
    } else if (fs.existsSync(legacyRoomodesPath)) {
      console.log(`Using legacy mode set .roomodes file for "${setName}" (transitional support)`);
      srcRoomodesPath = legacyRoomodesPath;
    } else {
      console.log(`Warning: Mode set .roomodes file for "${setName}" not found, falling back to default .roomodes`);
      srcRoomodesPath = path.join(sourceDir, '.roomodes');
    }
  } else {
    // Use default .roomodes file
    srcRoomodesPath = path.join(sourceDir, '.roomodes');
  }
  
  const destRoomodesPath = path.join(targetPath, '.roomodes');

  if (!fs.existsSync(srcRoomodesPath)) {
    console.log(`Warning: .roomodes file not found at ${srcRoomodesPath}`);
    return;
  }

  console.log(`${dryRun ? '[DRY RUN] Would process' : 'Processing'} .roomodes file from ${srcRoomodesPath}`);
  
  // If mode sets were regenerated, log that we're using the freshly generated file
  if (regenerated && setName) {
    console.log(`Using freshly regenerated .roomodes for ${setName} mode set`);
  }
  
  try {
    // Read source .roomodes file (which may have been regenerated)
    const srcRoomodesContent = fs.readFileSync(srcRoomodesPath, 'utf8');
    let srcRoomodes;
    
    try {
      srcRoomodes = JSON.parse(srcRoomodesContent);
    } catch (err) {
      console.error('Error parsing source .roomodes file:', err);
      return;
    }

    // Check if target .roomodes exists
    let destRoomodes = { customModes: [] };
    if (fs.existsSync(destRoomodesPath) && !dryRun) {
      try {
        const destRoomodesContent = fs.readFileSync(destRoomodesPath, 'utf8');
        destRoomodes = JSON.parse(destRoomodesContent);
        if (!destRoomodes.customModes) {
          destRoomodes.customModes = [];
        }
      } catch (err) {
        console.error('Error parsing destination .roomodes file:', err);
        // Continue with empty customModes array
      }
    }

    // Get existing mode slugs in destination
    const existingSlugs = new Set(destRoomodes.customModes.map(mode => mode.slug));

    // Copy modes directly from source since we're already using a filtered .roomodes file
    let modesToCopy = srcRoomodes.customModes || [];
    const addedModes = [];
    
    // Copy modes from source to destination, overwriting existing modes by default
    if (Array.isArray(modesToCopy)) {
      for (const mode of modesToCopy) {
        if (!mode.slug) {
          console.log(`  Skipped mode without slug`);
          continue;
        }
        
        if (existingSlugs.has(mode.slug)) {
          if (skipExisting) {
            console.log(`  Skipped existing mode: ${mode.name} (${mode.slug})`);
            continue;
          }
          
          // Overwrite existing mode
          if (!dryRun) {
            // Find and replace the existing mode
            const existingIndex = destRoomodes.customModes.findIndex(m => m.slug === mode.slug);
            if (existingIndex !== -1) {
              destRoomodes.customModes[existingIndex] = mode;
              console.log(`  Overwrote existing mode: ${mode.name} (${mode.slug})`);
              addedModes.push(mode.slug);
            }
          } else {
            console.log(`  ${dryRun ? '[DRY RUN] Would overwrite' : 'Overwrote'} existing mode: ${mode.name} (${mode.slug})`);
            addedModes.push(mode.slug);
          }
        } else {
          // Add new mode
          if (!dryRun) {
            destRoomodes.customModes.push(mode);
            existingSlugs.add(mode.slug);
          }
          console.log(`  ${dryRun ? '[DRY RUN] Would add' : 'Added'} mode: ${mode.name} (${mode.slug})`);
          addedModes.push(mode.slug);
        }
      }
    }

    // Write updated .roomodes file
    if (!dryRun) {
      fs.writeFileSync(destRoomodesPath, JSON.stringify(destRoomodes, null, 2), 'utf8');
      console.log(`✓ .roomodes file processed successfully`);
      // No need to track roomodes update action
    }
    
  } catch (err) {
    console.error('Error processing .roomodes file:', err);
  }
}

// Check if minimatch is available, if not, warn and continue without ignore functionality
try {
  require.resolve('minimatch');
} catch (e) {
  console.warn('Warning: minimatch package not found. .copyignore functionality will be limited.');
  // Simple fallback if minimatch is not available
  shouldIgnore = (filePath) => {
    const relativePath = path.relative(sourceDir, filePath);
    return ignorePatterns.some(pattern =>
      relativePath === pattern || relativePath.startsWith(pattern + '/'));
  };
}

/**
 * Check if mode set needs regeneration and regenerate if needed
 * @param {string} modeSetName - The name of the mode set to check
 * @returns {boolean} True if regeneration was performed
 */
function checkAndRegenerateModeSets(modeSetName) {
  if (!modeSetName) {
    return false; // No mode set specified, nothing to regenerate
  }

  console.log(`Checking if mode set "${modeSetName}" needs regeneration...`);
  
  // Check for mode set directory
  const modeSetDir = path.join(sourceDir, 'custom-sets', `${modeSetName}-agent`);
  const modeSetRoomodesPath = path.join(modeSetDir, '.roomodes');
  
  // For backwards compatibility, check for the old path format
  const legacyRoomodesPath = path.join(sourceDir, `.roomodes-${modeSetName}`);
  
  let needsRegeneration = false;
  
  // If the mode set directory or .roomodes file doesn't exist, we need to generate it
  if (!fs.existsSync(modeSetDir) || !fs.existsSync(modeSetRoomodesPath)) {
    console.log(`Mode set directory or .roomodes file not found for "${modeSetName}", will generate it.`);
    needsRegeneration = true;
  }
  
  if (!needsRegeneration) {
    // Get the last modified time of the .roomodes file
    const roomodesStats = fs.statSync(modeSetRoomodesPath);
    const roomodesModifiedTime = roomodesStats.mtime;
    
    // Load mode sets from the configuration file to get the list of modes in the set
    const modeSets = loadModeSets();
    const modesInSet = modeSets[modeSetName.toLowerCase()];
    
    if (!modesInSet) {
      console.error(`Error: Unknown mode set "${modeSetName}". Available sets: ${Object.keys(modeSets).join(', ')}`);
      process.exit(1);
    }
    
    // Check if any mode Markdown file is newer than the .roomodes file
    let newerModes = [];
    
    for (const mode of modesInSet) {
      // Convert mode slug to proper case for the filename (e.g., "frontcrafter" -> "Frontcrafter")
      const modeProperCase = mode.charAt(0).toUpperCase() + mode.slice(1);
      const modeFilePath = path.join(sourceDir, `${modeProperCase}-mode.md`);
      
      if (fs.existsSync(modeFilePath)) {
        const modeStats = fs.statSync(modeFilePath);
        const modeModifiedTime = modeStats.mtime;
        
        if (modeModifiedTime > roomodesModifiedTime) {
          needsRegeneration = true;
          newerModes.push(modeProperCase);
        }
      }
    }
    
    if (needsRegeneration) {
      console.log(`Found newer mode files: ${newerModes.join(', ')}`);
    }
  }
  
  if (needsRegeneration) {
    console.log(`Regenerating mode set "${modeSetName}"...`);
    
    if (!dryRun) {
      execSync(`node scripts/generate-mode-sets.js ${modeSetName}`, { stdio: 'inherit' });
      console.log(`✓ Regenerated mode set: ${modeSetName}`);
      // No need to track mode set generation action
      return true;
    } else {
      console.log(`[DRY RUN] Would regenerate mode set: ${modeSetName}`);
      return false;
    }
  }
  
  console.log(`Mode set "${modeSetName}" is up to date, no regeneration needed.`);
  return false;
}

// Execute the copy operations
copyRooDirectory();
copyDocsDirectory();

// Check if mode set needs regeneration before copying
let regenerated = false;
if (modeSet) {
  regenerated = checkAndRegenerateModeSets(modeSet);
}

copyRoomodes(modeSet, regenerated);

// Always save operations log for playback if not in dry run mode
if (!dryRun && targetDir) {
  // Update the playback data with the current operation for this target
  playbackData[targetDir] = currentOperation;
  
  // Write the updated playback data to the file
  fs.writeFileSync(playbackFilePath, JSON.stringify(playbackData, null, 2), 'utf8');
  console.log(`\nPlayback information saved to: ${playbackFilePath}`);
}

console.log(`\nCopy operation ${dryRun ? 'would be' : 'was'} completed successfully!`);
