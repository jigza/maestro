#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * Parses a mode markdown file to extract the mode name, role definition, when to use, and custom instructions
 * @param {string} content - The content of the markdown file
 * @returns {Object} An object containing the mode name, slug, role, whenToUse, and instructions
 */
function parseModeMd(content) {
  // Extract mode name from the first heading
  const nameMatch = content.match(/^# ([^\n]+) Mode/m);
  if (!nameMatch) {
    throw new Error('Could not find mode name in markdown file');
  }
  const name = nameMatch[1];

  // Generate slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  // Extract role definition
  // This regex captures content after "## Role Definition" until the next "##" heading or end of file.
  const roleMatch = content.match(/## Role Definition\s+([\s\S]+?)(?=\n## |$)/);
  if (!roleMatch) {
    throw new Error('Could not find role definition in markdown file');
  }
  const role = roleMatch[1].trim();

  // Extract when to use section (optional)
  // This regex captures content after "## When To Use" until the next "## Custom Instructions" heading or end of file.
  const whenToUseMatch = content.match(/## When To Use\s+([\s\S]+?)(?=\n## Custom Instructions|$)/);
  // whenToUse is optional, so no error if not found.
  const whenToUse = whenToUseMatch ? whenToUseMatch[1].trim() : undefined; // Use undefined if not found

  // Extract custom instructions (which will be Critical Rules in the new structure)
  // This regex captures content after "## Custom Instructions" until the next "##" heading or end of file.
  const instructionsMatch = content.match(/## Custom Instructions\s+([\s\S]+?)(?=\n## |$)/);
   if (!instructionsMatch) {
     // In the new structure, Custom Instructions might only contain Critical Rules,
     // but the section heading "## Custom Instructions" should still be present.
     // If the heading is missing, it's an error according to the plan's structure.
     throw new Error('Could not find custom instructions section in markdown file');
   }
  const instructions = instructionsMatch[1].trim();


  return {
    name,
    slug,
    role,
    whenToUse, // Add whenToUse here
    instructions // This will be the Critical Rules section content
  };
}

/**
 * Main function to generate the .roomodes configuration file
 */
async function generateModesConfig() {
  // Check for --global flag
  const isGlobal = process.argv.includes('--global');
  const outputFilename = isGlobal ? 'custom_modes.json' : '.roomodes';
  const sourceValue = isGlobal ? 'global' : 'project';

  try {
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
        const mode = parseModeMd(content);

        // Add mode to the array
        modes.push({
          slug: mode.slug,
          name: mode.name,
          roleDefinition: mode.role,
          whenToUse: mode.whenToUse, // Add whenToUse property
          customInstructions: mode.instructions, // This will be the Critical Rules content
          groups: [
            "read",
            "edit",
            "browser",
            "command",
            "mcp"
          ],
          source: sourceValue
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

    // Write the configuration to .roomodes file
    const configJson = JSON.stringify(roomodesConfig, null, 2);
    await writeFile(outputFilename, configJson);

    console.log(`Successfully generated ${outputFilename} configuration with ${modes.length} modes`);
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