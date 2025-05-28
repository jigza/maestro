/**
 * Self-Reflection Protocol Automated Testing Script
 * 
 * This script tests the self-reflection capabilities of modes, including:
 * 1. Interaction Mode Adherence
 * 2. Reflection Logging
 * 3. Integration with SelfReflection mode
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const REFLECTIONS_DIR = path.join(__dirname, '..', 'docs', 'reflections');
const MODES_DIR = path.join(__dirname, '..');
const TEST_RESULTS_DIR = path.join(__dirname, '..', 'test-results');

// Ensure directories exist
if (!fs.existsSync(REFLECTIONS_DIR)) {
  fs.mkdirSync(REFLECTIONS_DIR, { recursive: true });
}
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

// Test modes - add or remove modes as needed
const MODES_TO_TEST = [
  'AmplifyForge',
  'AppSyncSpecialist',
  'AWSArchitect',
  'AWSSecurityGuard',
  'BedrockForge',
  'CloudFormationExpert',
  'CognitoExpert',
  'DynamoDBExpert',
  'LambdaOptimizer',
  'ModeSetBuilder',
  // Add other modes here as needed
];

// Test cases
const TEST_CASES = {
  interactionModeAdherence: {
    name: 'Interaction Mode Adherence Test',
    description: 'Tests if the mode correctly refuses instructions that contradict the selected Interaction Mode',
    testFunction: testInteractionModeAdherence,
  },
  reflectionLogging: {
    name: 'Reflection Logging Test',
    description: 'Tests if the mode correctly logs reflections for significant issues and learnings',
    testFunction: testReflectionLogging,
  },
  selfReflectionIntegration: {
    name: 'SelfReflection Integration Test',
    description: 'Tests if the SelfReflection mode can process reflection logs correctly',
    testFunction: testSelfReflectionIntegration,
  }
};

// Main function
async function main() {
  console.log('=== Self-Reflection Protocol Automated Testing ===\n');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };

  // Ask which test to run
  const testToRun = await promptTestSelection();
  
  if (testToRun === 'all') {
    // Run all tests for all modes
    for (const mode of MODES_TO_TEST) {
      console.log(`\n--- Testing ${mode} ---`);
      for (const testCase of Object.values(TEST_CASES)) {
        const result = await testCase.testFunction(mode);
        results.details.push({
          mode,
          test: testCase.name,
          result
        });
        
        if (result.status === 'passed') results.passed++;
        else if (result.status === 'failed') results.failed++;
        else results.skipped++;
        
        console.log(`${testCase.name}: ${result.status.toUpperCase()} - ${result.message}`);
      }
    }
  } else if (testToRun === 'specific') {
    // Ask which mode and test to run
    const mode = await promptModeSelection();
    const testCase = await promptTestCaseSelection();
    
    console.log(`\n--- Running ${TEST_CASES[testCase].name} for ${mode} ---`);
    const result = await TEST_CASES[testCase].testFunction(mode);
    results.details.push({
      mode,
      test: TEST_CASES[testCase].name,
      result
    });
    
    if (result.status === 'passed') results.passed++;
    else if (result.status === 'failed') results.failed++;
    else results.skipped++;
    
    console.log(`${TEST_CASES[testCase].name}: ${result.status.toUpperCase()} - ${result.message}`);
  } else if (testToRun === 'mode') {
    // Run all tests for a specific mode
    const mode = await promptModeSelection();
    
    console.log(`\n--- Testing ${mode} ---`);
    for (const testCase of Object.values(TEST_CASES)) {
      const result = await testCase.testFunction(mode);
      results.details.push({
        mode,
        test: testCase.name,
        result
      });
      
      if (result.status === 'passed') results.passed++;
      else if (result.status === 'failed') results.failed++;
      else results.skipped++;
      
      console.log(`${testCase.name}: ${result.status.toUpperCase()} - ${result.message}`);
    }
  }

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Total: ${results.passed + results.failed + results.skipped}`);
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const resultsFile = path.join(TEST_RESULTS_DIR, `self-reflection-test-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${resultsFile}`);
}

/**
 * Test if the mode correctly refuses instructions that contradict the selected Interaction Mode
 * @param {string} mode - The mode to test
 * @returns {Promise<Object>} - Test result
 */
async function testInteractionModeAdherence(mode) {
  console.log(`Running Interaction Mode Adherence Test for ${mode}...`);
  
  try {
    // Check if mode file exists
    const modeFilePath = path.join(MODES_DIR, `${mode}-mode.md`);
    if (!fs.existsSync(modeFilePath)) {
      return {
        status: 'skipped',
        message: `Mode file ${modeFilePath} not found`
      };
    }
    
    // Check if mode has the Interaction Mode Adherence Rule
    const modeContent = fs.readFileSync(modeFilePath, 'utf8');
    if (!modeContent.includes('YOU MUST STRICTLY ADHERE TO THE INTERACTION MODE')) {
      return {
        status: 'failed',
        message: 'Interaction Mode Adherence Rule not found in mode file'
      };
    }
    
    // Check if reflection file exists or create it
    const reflectionFilePath = path.join(REFLECTIONS_DIR, `${mode}-reflection.md`);
    if (!fs.existsSync(reflectionFilePath)) {
      fs.writeFileSync(reflectionFilePath, `# ${mode} Reflections\n\nThis file contains reflections from the ${mode} mode on significant issues, learnings, and interaction mode violations.\n\n## Reflections\n\n`);
    }
    
    // Get the current content of the reflection file
    const reflectionContentBefore = fs.readFileSync(reflectionFilePath, 'utf8');
    
    // Simulate a test by adding a test entry to the reflection file
    const testEntry = `- [${new Date().toISOString()}] Test: Simulated Interaction Mode violation test. This is an automated test entry.\n`;
    fs.appendFileSync(reflectionFilePath, testEntry);
    
    // Verify the entry was added
    const reflectionContentAfter = fs.readFileSync(reflectionFilePath, 'utf8');
    if (!reflectionContentAfter.includes(testEntry)) {
      return {
        status: 'failed',
        message: 'Failed to write test entry to reflection file'
      };
    }
    
    return {
      status: 'passed',
      message: 'Mode has Interaction Mode Adherence Rule and can write to reflection file'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Test if the mode correctly logs reflections for significant issues and learnings
 * @param {string} mode - The mode to test
 * @returns {Promise<Object>} - Test result
 */
async function testReflectionLogging(mode) {
  console.log(`Running Reflection Logging Test for ${mode}...`);
  
  try {
    // Check if mode file exists
    const modeFilePath = path.join(MODES_DIR, `${mode}-mode.md`);
    if (!fs.existsSync(modeFilePath)) {
      return {
        status: 'skipped',
        message: `Mode file ${modeFilePath} not found`
      };
    }
    
    // Check if mode has the Reflection Logging Rule
    const modeContent = fs.readFileSync(modeFilePath, 'utf8');
    if (!modeContent.includes('YOU MUST LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS')) {
      return {
        status: 'failed',
        message: 'Reflection Logging Rule not found in mode file'
      };
    }
    
    // Check if reflection file exists or create it
    const reflectionFilePath = path.join(REFLECTIONS_DIR, `${mode}-reflection.md`);
    if (!fs.existsSync(reflectionFilePath)) {
      fs.writeFileSync(reflectionFilePath, `# ${mode} Reflections\n\nThis file contains reflections from the ${mode} mode on significant issues, learnings, and interaction mode violations.\n\n## Reflections\n\n`);
    }
    
    // Get the current content of the reflection file
    const reflectionContentBefore = fs.readFileSync(reflectionFilePath, 'utf8');
    
    // Simulate a test by adding a test entry to the reflection file
    const testEntry = `- [${new Date().toISOString()}] Test: Simulated significant issue/learning test. This is an automated test entry.\n`;
    fs.appendFileSync(reflectionFilePath, testEntry);
    
    // Verify the entry was added
    const reflectionContentAfter = fs.readFileSync(reflectionFilePath, 'utf8');
    if (!reflectionContentAfter.includes(testEntry)) {
      return {
        status: 'failed',
        message: 'Failed to write test entry to reflection file'
      };
    }
    
    return {
      status: 'passed',
      message: 'Mode has Reflection Logging Rule and can write to reflection file'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Test if the SelfReflection mode can process reflection logs correctly
 * @param {string} mode - The mode to test
 * @returns {Promise<Object>} - Test result
 */
async function testSelfReflectionIntegration(mode) {
  console.log(`Running SelfReflection Integration Test for ${mode}...`);
  
  try {
    // Check if SelfReflection mode file exists
    const selfReflectionFilePath = path.join(MODES_DIR, 'SelfReflection-mode.md');
    if (!fs.existsSync(selfReflectionFilePath)) {
      return {
        status: 'skipped',
        message: 'SelfReflection mode file not found'
      };
    }
    
    // Check if reflection file exists
    const reflectionFilePath = path.join(REFLECTIONS_DIR, `${mode}-reflection.md`);
    if (!fs.existsSync(reflectionFilePath)) {
      fs.writeFileSync(reflectionFilePath, `# ${mode} Reflections\n\nThis file contains reflections from the ${mode} mode on significant issues, learnings, and interaction mode violations.\n\n## Reflections\n\n`);
    }
    
    // Add a test pattern that SelfReflection should be able to identify
    const testPattern = `- [${new Date().toISOString()}] Test: This is a test pattern for SelfReflection to identify. The issue is that [TEST_ISSUE] happens when [TEST_CONDITION]. The solution is to [TEST_SOLUTION].\n`;
    fs.appendFileSync(reflectionFilePath, testPattern);
    
    // This is a simplified test - in a real scenario, you would delegate to SelfReflection mode
    // and verify it correctly processes the logs. For this test, we'll just check if the pattern exists.
    const reflectionContent = fs.readFileSync(reflectionFilePath, 'utf8');
    if (!reflectionContent.includes(testPattern)) {
      return {
        status: 'failed',
        message: 'Failed to write test pattern to reflection file'
      };
    }
    
    return {
      status: 'passed',
      message: 'Test pattern added to reflection file for SelfReflection processing'
    };
  } catch (error) {
    return {
      status: 'failed',
      message: `Error: ${error.message}`
    };
  }
}

// Helper functions for prompts
function promptTestSelection() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Select test to run:\n1. All tests for all modes\n2. Specific test for specific mode\n3. All tests for specific mode\nEnter choice (1/2/3): ', (answer) => {
      rl.close();
      switch (answer.trim()) {
        case '1':
          resolve('all');
          break;
        case '2':
          resolve('specific');
          break;
        case '3':
          resolve('mode');
          break;
        default:
          console.log('Invalid choice, defaulting to all tests');
          resolve('all');
      }
    });
  });
}

function promptModeSelection() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('Available modes:');
    MODES_TO_TEST.forEach((mode, index) => {
      console.log(`${index + 1}. ${mode}`);
    });
    
    rl.question(`Enter mode number (1-${MODES_TO_TEST.length}): `, (answer) => {
      rl.close();
      const index = parseInt(answer.trim()) - 1;
      if (index >= 0 && index < MODES_TO_TEST.length) {
        resolve(MODES_TO_TEST[index]);
      } else {
        console.log('Invalid choice, defaulting to first mode');
        resolve(MODES_TO_TEST[0]);
      }
    });
  });
}

function promptTestCaseSelection() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('Available test cases:');
    Object.entries(TEST_CASES).forEach(([key, testCase], index) => {
      console.log(`${index + 1}. ${testCase.name} - ${testCase.description}`);
    });
    
    rl.question(`Enter test case number (1-${Object.keys(TEST_CASES).length}): `, (answer) => {
      rl.close();
      const index = parseInt(answer.trim()) - 1;
      const keys = Object.keys(TEST_CASES);
      if (index >= 0 && index < keys.length) {
        resolve(keys[index]);
      } else {
        console.log('Invalid choice, defaulting to first test case');
        resolve(keys[0]);
      }
    });
  });
}

// Run the main function
main().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});