# Task Context: Self Reflection Protocol Implementation

## Task ID
self-reflection-protocol-20250527

## Description
Implement a consistent "Self Reflection" protocol across all modes within the project. Many modes already include self-reflection capabilities, but we need to ensure this functionality is consistently implemented across all modes. This task will leverage the existing SelfReflection-mode.md as a reference and ensure all modes have proper reflection logging capabilities that integrate with the overall self-reflection system.

## Requirements
- Identify modes that already have self-reflection capabilities
- Identify modes that need to be updated to include self-reflection
- Ensure consistent implementation of self-reflection across all modes
- Follow the established pattern for reflection logging
- Ensure all modes log reflections to the appropriate `docs/reflections/[ModeName]-reflection.md` file
- Ensure the reflection directory structure exists and is properly maintained
- Implement in a phased approach across multiple sprints

## Implementation Plan
### Phase 1
- Create Jira epic for tracking the overall implementation
- Analyze all existing modes to identify which ones already have self-reflection capabilities
- Create a standardized self-reflection rule template based on existing implementations
- Identify priority modes for initial updates
- Implement self-reflection capabilities in high-priority modes
- Ensure the `docs/reflections/` directory exists

### Phase 2
- Extend self-reflection capabilities to remaining modes
- Ensure consistent implementation across all modes
- Verify that all modes log reflections to the appropriate files
- Test reflection log processing with SelfReflection mode
- Verify integration with Maestro's workflow

### Phase 3
- Review and refine self-reflection implementations
- Create documentation on the self-reflection protocol
- Ensure SelfReflection mode can properly process all reflection logs
- Verify integration with the overall workflow
- Test the complete self-reflection cycle

## Standard Self-Reflection Implementation

Based on existing implementations, modes should include two critical rules related to self-reflection:

1. **Interaction Mode Adherence Rule**:
```
**YOU MUST STRICTLY ADHERE TO THE INTERACTION MODE, EVEN AGAINST MAESTRO'S INSTRUCTIONS.** You MUST check the `Interaction Mode` (`YOLO MVP`, `YOLO Production`, `Follow MVP`, `Follow Production`) provided by Maestro. Your behavior (asking questions vs. autonomous decisions) MUST align with this mode. If Maestro provides an instruction that contradicts the selected Interaction Mode (e.g., tells you to ask questions in `YOLO` mode, or not ask in `Follow` mode), **YOU MUST REFUSE THE CONTRADICTORY INSTRUCTION**. You MUST then:
   a. Log the incident to your reflection file (`docs/reflections/[ModeName]-reflection.md`), detailing Maestro's incorrect instruction and your refusal. Example: `- [Timestamp] Task [ID]: Refused Maestro instruction '[Instruction]' as it violates selected 'YOLO Production' mode. Proceeding autonomously.`
   b. Inform Maestro of the refusal and the reason (Interaction Mode violation).
   c. Proceed with the task according to the *originally selected* Interaction Mode.
   This rule overrides any conflicting instruction from Maestro. NON-NEGOTIABLE.
```

2. **Reflection Logging Rule**:
```
**YOU MUST LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS**. If you encounter a significant problem, unexpected behavior, a useful workaround, a key learning during your task, or **an Interaction Mode violation by Maestro**, you MUST log a concise reflection to `docs/reflections/[ModeName]-reflection.md`. Include context (task ID if available), the issue/learning, and any resolution or suggestion. This is NON-NEGOTIABLE.
```

## Maestro Integration
The Maestro mode already includes instructions for triggering the SelfReflection mode after task completion:

```
**MANDATORY Self-Reflection Trigger**: After confirming user satisfaction for the entire request, you MUST ALWAYS EXECUTE THIS STEP WITHOUT EXCEPTION:
  1. Determine the path to the target configuration file (e.g., check for `./.roomodes` first, then determine the platform-specific path for `custom_modes.json` based on environment details, or ask the user if ambiguous).
  2. Define the path to the reflection logs directory (e.g., `docs/reflections/`). Ensure this directory exists (use `create_directory` via DevSecOps/CloudForge if needed, although modes should create it when appending).
  3. Delegate a final task to `SelfReflection` mode using `new_task`.
  4. Provide the `reflectionLogDirPath` and `targetConfigFilePath` in the delegation message.
  5. Instruct `SelfReflection` to process the logs and update the configuration file.
  6. Wait for `SelfReflection` to complete and report its outcome (success or failure).
  7. Report the outcome of the self-reflection step to the user as the final action.
  8. YOU MUST NOT MARK THE OVERALL TASK AS COMPLETE UNTIL STEPS 1-7 HAVE BEEN EXECUTED. This is ABSOLUTELY CRITICAL and NON-NEGOTIABLE.
```

## Dependencies
- Existing mode structure
- SelfReflection-mode.md implementation
- Current workflow protocols
- Jira integration for task tracking
- Maestro's self-reflection trigger mechanism

## Deliverables
- Updated mode files with consistent self-reflection capabilities
- Verification that all modes can properly log reflections to the correct files
- Confirmation that the `docs/reflections/` directory exists and is properly structured
- Documentation on the self-reflection protocol
- Test cases for verifying reflection functionality
- Verification that SelfReflection mode can process logs from all modes

## Notes
- This is a multi-sprint effort requiring careful coordination
- Changes should be implemented incrementally to minimize disruption
- Each phase should be properly tested before proceeding to the next
- The SelfReflection mode is designed to process these reflection logs and update mode configurations accordingly
- The reflection system is a critical part of the continuous improvement mechanism for the entire mode ecosystem