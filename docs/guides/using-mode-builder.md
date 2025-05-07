# Using the Mode Builder

## Overview

The Mode Builder is a specialized Roo mode designed to assist and guide users through the creation of new modes or enhancement of existing modes for the Maestro ecosystem. This mode helps ensure that all modes are well-defined, properly integrated, and follow established patterns and best practices.

## When to Use Mode Builder

Use the Mode Builder when you need to:

1. **Create a new specialized mode** to fill a gap in the current system
2. **Enhance an existing mode** with new capabilities or protocols
3. **Validate a mode's structure and integration** with the Maestro ecosystem
4. **Understand best practices** for mode creation and maintenance
5. **Generate comprehensive mode documentation** in the correct format

## How Mode Builder Works

Mode Builder follows a structured approach to both mode creation and enhancement:

### 1. Analysis

First, Mode Builder conducts careful analysis:
- For new modes, determining if the need is already covered by existing modes
- For enhancements, analyzing the existing mode's purpose and functionality
- Identifying potential overlaps with other modes
- Validating the need for creation or enhancement
- Determining appropriate scope and boundaries

### 2. Mode Structure Development

Next, Mode Builder helps you create a properly structured mode definition:
- Crafting a clear role definition
- Developing appropriate critical rules
- Creating comprehensive, specific protocols
- Including quality assurance requirements for coding modes

### 3. Integration Planning

Mode Builder ensures your new mode integrates seamlessly:
- Planning Maestro integration (delegation, task types)
- Defining context management requirements
- Establishing workflow integration points
- Documenting integration with other modes

### 4. Validation

Mode Builder validates that your mode:
- Has clear, non-overlapping responsibilities
- Follows the standard format and structure
- Contains specific, actionable instructions
- Properly defines handoff points and collaboration

### 5. Documentation

Mode Builder helps with documentation needs:
- Creating README.md updates
- Recommending diagram updates
- Specifying mode selection table updates
- Providing usage documentation

### 6. Implementation

Finally, Mode Builder assists with:
- For new modes: Creating the complete mode definition file
- For enhancements: Presenting clear diffs with rationales for changes
- Providing guidance for generating the mode
- Suggesting testing approaches
- Offering maintenance considerations

## Working With Mode Builder

To get the most out of Mode Builder:

1. **Be specific about the mode's purpose** - Clearly describe what gap the mode will fill
2. **Consider existing modes** - Be familiar with current modes to avoid overlap
3. **Focus on boundaries** - Clearly define what the mode should and shouldn't do
4. **Think about collaboration** - Define how the mode will work with others
5. **Provide quality requirements** - Specify what quality attributes the mode prioritizes
6. **Be open to iteration** - Mode development often requires refinement

## Mode Creation Process

1. Start by telling Mode Builder about the new mode you want to create
2. Answer Mode Builder's clarifying questions about purpose, boundaries, and integration
3. Review the draft mode definition and provide feedback
4. Iterate as needed to refine the mode definition
5. Save the completed mode definition to a markdown file
6. Follow Mode Builder's guidance for updating README.md and Maestro
7. Use the generate-modes.js script to update the .roomodes configuration

## Example Mode Requests

### Creating a New Mode
"I need a new mode called 'AccessibilityTester' that specializes in testing applications for accessibility compliance. It should focus on WCAG standards, screen reader compatibility, keyboard navigation, and color contrast analysis."

### Enhancing an Existing Mode
"I'd like to enhance the SecurityTester mode to include capabilities for API security testing, focusing on authentication vulnerabilities, injection attacks, and rate limiting tests."

## Best Practices

- **One responsibility area per mode** - Keep modes focused on a specific domain
- **Clear boundaries** - Define explicitly what the mode should and shouldn't do
- **Comprehensive protocols** - Include detailed, specific instructions
- **Standard rules** - Include all required critical rules
- **Quality checks** - For coding modes, include pre-completion quality checks
- **Documentation** - Save all outputs to appropriate files in the /docs directory

## Maintaining Modes

### After Creating a New Mode

1. **Run the generator** - Update the .roomodes configuration using generate-modes.js
2. **Test the mode** - Verify it works as expected in actual usage
3. **Collect feedback** - Gather user feedback on effectiveness and clarity
4. **Iterate** - Refine the mode based on real-world usage
5. **Keep documentation updated** - Ensure README.md and other docs stay current

### After Enhancing an Existing Mode

1. **Review changes** - Ensure enhancements maintain coherence with the mode's core purpose
2. **Run the generator** - Update the .roomodes configuration using generate-modes.js
3. **Test the enhancements** - Verify new capabilities work as expected
4. **Check for regressions** - Ensure existing functionality wasn't broken
5. **Update mode references** - Check if other modes reference this mode and update if needed
6. **Update documentation** - Ensure README.md reflects the enhanced capabilities

## Getting Help

If you need assistance with mode creation or have questions about the process, Mode Builder is here to help. Simply describe your needs and Mode Builder will guide you through the process step by step.