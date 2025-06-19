# Self-Reflection Test Results

This directory contains test results from the automated testing of the Self-Reflection Protocol.

## Purpose

The test results stored in this directory provide evidence of:

1. **Interaction Mode Adherence**: Tests verifying that modes correctly refuse instructions that contradict the selected Interaction Mode
2. **Reflection Logging**: Tests confirming that modes properly log reflections for significant issues and learnings
3. **SelfReflection Integration**: Tests validating that the SelfReflection mode can process reflection logs correctly

## File Format

Test result files follow this naming convention:

```
self-reflection-test-[TIMESTAMP].json
```

Each file contains a JSON object with the following structure:

```json
{
  "passed": 10,
  "failed": 0,
  "skipped": 2,
  "details": [
    {
      "mode": "ModeName",
      "test": "Test Name",
      "result": {
        "status": "passed|failed|skipped",
        "message": "Detailed result message"
      }
    },
    ...
  ]
}
```

## Usage

### For Developers

- Review test results to verify the Self-Reflection Protocol is working correctly
- Identify modes that may need fixes or updates to their self-reflection capabilities
- Track the progress of self-reflection implementation across the system

### For QA

- Use as evidence of system compliance with self-reflection requirements
- Identify regression issues in self-reflection capabilities
- Validate that all modes adhere to the Interaction Mode settings

## Running Tests

To run the automated tests and generate new result files, use the test-self-reflection.js script:

```bash
node scripts/test-self-reflection.js
```

The script provides options to:
1. Run all tests for all modes
2. Run a specific test for a specific mode
3. Run all tests for a specific mode

## Maintenance

Test result files should be retained for historical purposes but may be periodically archived to prevent this directory from growing too large.

For more information on the Self-Reflection Protocol, see `docs/project-management/self-reflection-system-guide.md`.