#!/usr/bin/env node

/**
 * Script to copy Maestro project files to a target directory
 * - Copies .roo directory
 * - Copies docs directory (excluding guides)
 * - Selectively copies mode definitions from .roomodes
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

// Store original command for playback
const originalCommand = process.argv.slice(1).join(' ');

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    help = true;
  } else if (arg === '--playback' || arg === '-p') {
    playbackMode = true;
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      playbackFile = args[++i];
      console.log(`Using playback file: ${playbackFile}`);
      // Load operations from playback file
      try {
        const playbackData = JSON.parse(fs.readFileSync(playbackFile, 'utf8'));
        // Process playback data
        console.log(`Loaded ${Object.keys(playbackData).length} operations from playback file`);
      } catch (err) {
        console.error(`Error loading playback file: ${err.message}`);
        process.exit(1);
      }
    }
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
  --playback, -p      Enable playback mode, optionally with a playback file
  --mode-set, -m      Specify a mode set to copy (e.g., "core", "frontend", "backend")
                      Note: Mode sets are automatically regenerated if any mode Markdown files
                      are newer than the .roomodes-{modeset} file
  --dry-run, -d       Show what would be copied without making changes
  --skip-existing, -s Skip existing modes instead of overwriting them (default: overwrite)

Examples:
  node copy_maestro.js ../my-project
  node copy_maestro.js --mode-set frontend ../my-project
  node copy_maestro.js --dry-run ../my-project
  node copy_maestro.js --skip-existing ../my-project
  node copy_maestro.js --playback operations.json ../my-project
  node copy_maestro.js                           # Run in playback mode
  `);
  process.exit(0);
}

// If in playback mode without a target directory, just show playback info and exit
if (playbackMode && !targetDir) {
  const playbackFilePath = path.join(process.cwd(), 'copy_maestro_playback.json');
  
  if (fs.existsSync(playbackFilePath)) {
    try {
      const playbackData = JSON.parse(fs.readFileSync(playbackFilePath, 'utf8'));
      console.log('\nPlayback file information:');
      console.log(`- Timestamp: ${playbackData.timestamp}`);
      console.log(`- Original command: ${playbackData.command}`);
      console.log(`- Target directory: ${playbackData.target}`);
      console.log(`- Actions: ${playbackData.actions.length}`);
      console.log('\nTo replay this operation, run:');
      console.log(`node scripts/copy_maestro.js ${playbackData.target}`);
      console.log('\nTo view detailed actions, examine the playback file:');
      console.log(playbackFilePath);
    } catch (err) {
      console.error(`Error reading playback file: ${err.message}`);
    }
  } else {
    console.log('No playback file found. Run a copy operation first to generate one.');
  }
  
  process.exit(0);
}

// Operations log for playback
const operations = {
  timestamp: new Date().toISOString(),
  command: originalCommand,
  target: targetDir,
  actions: []
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
  operations.actions.push({
    type: 'create_directory',
    path: targetPath
  });
} else if (!fs.existsSync(targetPath)) {
  console.log(`[DRY RUN] Would create target directory: ${targetPath}`);
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
        operations.actions.push({
          type: 'copy_file',
          source: srcPath,
          destination: destPath
        });
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
    operations.actions.push({
      type: 'copy_directory',
      source: srcRooDir,
      destination: destRooDir
    });
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
    operations.actions.push({
      type: 'copy_directory_filtered',
      source: srcDocsDir,
      destination: destDocsDir,
      excludes: ['guides']
    });
  }
}

/**
 * Copy selective .mode definitions from .roomodes
 * @param {boolean} regenerated - Whether mode sets were regenerated
 */
function copyRoomodes(regenerated = false) {
  // Determine source .roomodes file path based on mode set
  let srcRoomodesPath;
  if (modeSet) {
    // Use mode set-specific .roomodes file if available
    const modeSetRoomodesPath = path.join(sourceDir, `.roomodes-${modeSet}`);
    if (fs.existsSync(modeSetRoomodesPath)) {
      srcRoomodesPath = modeSetRoomodesPath;
      console.log(`Using mode set-specific .roomodes file for "${modeSet}" set`);
    } else {
      console.log(`Warning: Mode set-specific .roomodes file for "${modeSet}" not found, falling back to default .roomodes`);
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
  if (regenerated && modeSet) {
    console.log(`Using freshly regenerated .roomodes-${modeSet} file`);
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

    // Filter modes based on mode set if specified
    let modesToCopy = srcRoomodes.customModes || [];
    const addedModes = [];
    
    if (modeSet) {
      // Load mode sets from the configuration file
      const modeSets = loadModeSets();
      
      const selectedSet = modeSets[modeSet.toLowerCase()];
      
      if (!selectedSet) {
        console.error(`Error: Unknown mode set "${modeSet}". Available sets: ${Object.keys(modeSets).join(', ')}`);
        process.exit(1);
      }
      
      if (selectedSet.length > 0) {
        modesToCopy = modesToCopy.filter(mode => selectedSet.includes(mode.slug));
        console.log(`Filtered to ${modesToCopy.length} modes in the "${modeSet}" set`);
      }
    }

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
      operations.actions.push({
        type: 'update_roomodes',
        source: srcRoomodesPath,
        destination: destRoomodesPath,
        added_modes: addedModes,
        skip_existing: skipExisting,
        regenerated: regenerated
      });
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
 * Check if any mode Markdown files are newer than the .roomodes-{modeset} file
 * and regenerate mode sets if needed
 * @param {string} modeSetName - The name of the mode set to check
 * @returns {boolean} True if regeneration was performed
 */
function checkAndRegenerateModeSets(modeSetName) {
  if (!modeSetName) {
    return false; // No mode set specified, nothing to regenerate
  }

  console.log(`Checking if mode set "${modeSetName}" needs regeneration...`);
  
  // Path to the .roomodes-{modeset} file
  const roomodesPath = path.join(sourceDir, `.roomodes-${modeSetName}`);
  
  // If the .roomodes-{modeset} file doesn't exist, we need to generate it
  if (!fs.existsSync(roomodesPath)) {
    console.log(`Mode set file .roomodes-${modeSetName} not found, will generate it.`);
    if (!dryRun) {
      execSync(`node scripts/generate-mode-sets.js`, { stdio: 'inherit' });
      console.log(`✓ Generated all mode sets`);
      operations.actions.push({
        type: 'generate_mode_sets',
        reason: `Mode set file .roomodes-${modeSetName} not found`
      });
      return true;
    } else {
      console.log(`[DRY RUN] Would generate all mode sets`);
      return false;
    }
  }
  
  // Get the last modified time of the .roomodes-{modeset} file
  const roomodesStats = fs.statSync(roomodesPath);
  const roomodesModifiedTime = roomodesStats.mtime;
  
  // Load mode sets from the configuration file to get the list of modes in the set
  const modeSets = loadModeSets();
  const modesInSet = modeSets[modeSetName.toLowerCase()];
  
  if (!modesInSet) {
    console.error(`Error: Unknown mode set "${modeSetName}". Available sets: ${Object.keys(modeSets).join(', ')}`);
    process.exit(1);
  }
  
  // Check if any mode Markdown file is newer than the .roomodes-{modeset} file
  let needsRegeneration = false;
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
    console.log(`Regenerating all mode sets...`);
    
    if (!dryRun) {
      execSync(`node scripts/generate-mode-sets.js`, { stdio: 'inherit' });
      console.log(`✓ Regenerated all mode sets`);
      operations.actions.push({
        type: 'generate_mode_sets',
        reason: `Newer mode files found: ${newerModes.join(', ')}`,
        newer_modes: newerModes
      });
      return true;
    } else {
      console.log(`[DRY RUN] Would regenerate all mode sets`);
      return false;
    }
  }
  
  console.log(`Mode set "${modeSetName}" is up to date, no regeneration needed.`);
  return false;
}

// Execute the copy operations
copyRooDirectory();
copyDocsDirectory();

// Check if mode sets need regeneration before copying
let regenerated = false;
if (modeSet) {
  regenerated = checkAndRegenerateModeSets(modeSet);
}

copyRoomodes(regenerated);

// Always save operations log for playback if not in dry run mode
if (!dryRun) {
  const playbackFilePath = path.join(process.cwd(), 'copy_maestro_playback.json');
  fs.writeFileSync(playbackFilePath, JSON.stringify(operations, null, 2), 'utf8');
  console.log(`\nPlayback file saved to: ${playbackFilePath}`);
}

console.log(`\nCopy operation ${dryRun ? 'would be' : 'was'} completed successfully!`);