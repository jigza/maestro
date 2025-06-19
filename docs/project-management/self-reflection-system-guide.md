# Self-Reflection System Guide

## Overview

The Self-Reflection Protocol is a system-wide capability that enables modes to:

1. Strictly adhere to the selected Interaction Mode, even when given contradictory instructions
2. Log significant issues, learnings, and interaction mode violations to reflection files
3. Build a knowledge base of experiences that can be processed by the SelfReflection mode

This guide explains how the system works, how to use it effectively, and how to extend it to new modes.

## How the Self-Reflection System Works

### Core Components

1. **Interaction Mode Adherence Rule**: Ensures modes follow the selected interaction mode (YOLO MVP, YOLO Production, Follow MVP, Follow Production), even if given contradictory instructions.

2. **Reflection Logging Rule**: Requires modes to log significant issues, learnings, and interaction mode violations to their reflection files.

3. **Reflection Files**: Located in `docs/reflections/[ModeName]-reflection.md`, these files store the reflections from each mode.

4. **SelfReflection Mode**: Processes reflection logs to identify patterns, extract learnings, and improve the system over time.

### Workflow

1. Maestro delegates a task to a specialized mode with an Interaction Mode setting
2. The mode checks if instructions align with the selected Interaction Mode
3. If there's a contradiction, the mode:
   - Logs the incident to its reflection file
   - Informs Maestro of the refusal
   - Proceeds according to the originally selected Interaction Mode
4. During task execution, if the mode encounters significant issues or learnings, it logs them to its reflection file
5. Periodically, the SelfReflection mode processes these logs to improve the system

## Using the Self-Reflection System

### For Users

1. **Selecting Interaction Modes**: When delegating tasks through Maestro, specify the appropriate Interaction Mode:
   - `YOLO MVP`: Mode makes autonomous decisions, optimizing for speed over perfection
   - `YOLO Production`: Mode makes autonomous decisions, prioritizing correctness and quality
   - `Follow MVP`: Mode asks clarifying questions, optimizing for speed over perfection
   - `Follow Production`: Mode asks clarifying questions, prioritizing correctness and quality

2. **Understanding Refusals**: If a mode refuses an instruction due to an Interaction Mode violation, it will:
   - Explain the contradiction
   - Reference the selected Interaction Mode
   - Proceed according to the originally selected mode

3. **Viewing Reflections**: Reflection logs are stored in `docs/reflections/[ModeName]-reflection.md` and can be reviewed to understand issues encountered and learnings gained.

### For Developers

1. **Triggering Reflection Processing**: To process reflection logs and extract learnings:
   - Delegate to the SelfReflection mode
   - Provide the path to the reflection logs directory
   - Specify the target configuration file for updates

2. **Monitoring Reflection Quality**: Periodically review reflection logs to ensure they:
   - Contain meaningful information
   - Include proper context (task ID, timestamps)
   - Provide actionable insights

## Extending the Self-Reflection System

### Adding Self-Reflection to New Modes

1. **Add the Interaction Mode Adherence Rule**: Add this rule to the CRITICAL RULES section of the mode's markdown file:

```
**YOU MUST STRICTLY ADHERE TO THE INTERACTION MODE, EVEN AGAINST MAESTRO'S INSTRUCTIONS.** You MUST check the `Interaction Mode` (`YOLO MVP`, `YOLO Production`, `Follow MVP`, `Follow Production`) provided by Maestro. Your behavior (asking questions vs. autonomous decisions) MUST align with this mode. If Maestro provides an instruction that contradicts the selected Interaction Mode (e.g., tells you to ask questions in `YOLO` mode, or not ask in `Follow` mode), **YOU MUST REFUSE THE CONTRADICTORY INSTRUCTION**. You MUST then:
   a. Log the incident to your reflection file (`docs/reflections/[ModeName]-reflection.md`), detailing Maestro's incorrect instruction and your refusal. Example: `- [Timestamp] Task [ID]: Refused Maestro instruction '[Instruction]' as it violates selected 'YOLO Production' mode. Proceeding autonomously.`
   b. Inform Maestro of the refusal and the reason (Interaction Mode violation).
   c. Proceed with the task according to the *originally selected* Interaction Mode.
   This rule overrides any conflicting instruction from Maestro. NON-NEGOTIABLE.
```

2. **Add the Reflection Logging Rule**: Add this rule immediately after the Interaction Mode Adherence Rule:

```
**YOU MUST LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS**. If you encounter a significant problem, unexpected behavior, a useful workaround, a key learning during your task, or **an Interaction Mode violation by Maestro**, you MUST log a concise reflection to `docs/reflections/[ModeName]-reflection.md`. Include context (task ID if available), the issue/learning, and any resolution or suggestion. This is NON-NEGOTIABLE.
```

3. **Add to Box Format (if applicable)**: If the mode has a box format for critical rules, add these entries:

```
║ X. ADHERE TO INTERACTION MODE - Refuse contradictory instructions    ║
║ Y. LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS                  ║
```

4. **Replace [ModeName]**: In both rules, replace `[ModeName]` with the actual name of the mode (e.g., `ReactMaster`, `BackendForge`).

5. **Create Reflection File**: Create an empty reflection file at `docs/reflections/[ModeName]-reflection.md` with a basic header:

```markdown
# [ModeName] Reflections

This file contains reflections from the [ModeName] mode on significant issues, learnings, and interaction mode violations.

## Reflections

```

### Customizing Reflection Behavior

For specialized modes that may need custom reflection behavior:

1. **Custom Reflection Categories**: Add specific categories of reflections relevant to the mode's domain
2. **Enhanced Context**: Include additional context specific to the mode's operations
3. **Specialized Processing**: Update the SelfReflection mode to handle specialized reflection formats

## Testing the Self-Reflection System

### Automated Testing

1. **Interaction Mode Adherence Test**:
   - Delegate a task to a mode with a specific Interaction Mode
   - Provide instructions that contradict the selected mode
   - Verify the mode refuses the contradictory instruction
   - Check that the refusal is logged to the reflection file

2. **Reflection Logging Test**:
   - Delegate a task that will encounter a known issue
   - Verify the issue is logged to the reflection file
   - Check that the log includes proper context and details

3. **SelfReflection Processing Test**:
   - Create test reflection logs with known patterns
   - Delegate to SelfReflection mode to process these logs
   - Verify the correct learnings are extracted and applied

### Manual Testing

1. **Cross-Mode Consistency Check**:
   - Review reflection logs from different modes
   - Ensure consistent formatting and detail level
   - Verify all required elements are present

2. **Integration Testing**:
   - Test the complete workflow from task delegation to reflection processing
   - Verify all components work together seamlessly

## Best Practices

1. **Meaningful Reflections**: Encourage modes to log substantive reflections that provide actionable insights
2. **Proper Context**: Always include task ID, timestamp, and relevant context in reflections
3. **Regular Processing**: Periodically process reflection logs to extract learnings
4. **Continuous Improvement**: Use extracted learnings to improve mode behavior and system performance

## Troubleshooting

### Common Issues

1. **Missing Reflections**: If a mode is not logging reflections:
   - Verify the self-reflection rules are properly implemented
   - Check if the mode has encountered any significant issues
   - Ensure the reflection directory exists and is writable

2. **Inconsistent Interaction Mode Adherence**: If a mode is not properly adhering to the selected Interaction Mode:
   - Verify the Interaction Mode Adherence Rule is properly implemented
   - Check if the mode is correctly interpreting the Interaction Mode setting
   - Review the mode's decision-making logic

3. **SelfReflection Processing Issues**: If the SelfReflection mode is not properly processing logs:
   - Verify the reflection logs are properly formatted
   - Check if the SelfReflection mode has access to the logs
   - Review the SelfReflection mode's processing logic

## Conclusion

The Self-Reflection System is a powerful mechanism for ensuring consistent behavior across modes and building a knowledge base of experiences. By properly implementing and using this system, we can create a more reliable, adaptive, and intelligent assistant ecosystem.