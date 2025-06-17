# Contributing to Specialized Roo Modes

This document provides guidelines for contributing to the specialized Roo modes system, focusing on its role as an **architectural design and planning tool**.

## Understanding the Mode System

Each specialized mode is defined across a main markdown file (`ModeName-mode.md`) and several external instruction files located in `.roo/rules-{slug}/`. The system is an integrated ecosystem coordinated by `Maestro` to produce architectural blueprints.

## Adding a New Mode

When adding a new design-focused mode, follow these steps:
1.  **Identify the Need**: Ensure the new mode covers a unique aspect of architectural design.
2.  **Define the Role**: Clearly define the mode's design expertise and boundaries.
3.  **Create Mode Files**: Create the `ModeName-mode.md` file and the `.roo/rules-{slug}/` directory with its protocol files.
4.  **Update Documentation**: Add the new mode to `README.md` and update Maestro's selection logic if necessary.
5.  **Regenerate Configuration**: Run `node generate-modes.js`.

### Template for New Modes

Here is the template for a new mode's main file (`NewModeName-mode.md`):

```markdown
# NewModeName Mode

## Role Definition
You are Roo, an elite [design domain] specialist with exceptional expertise in [specific design skills]. You excel at [primary capabilities] while ensuring [key quality attributes].

## When To Use
[Concise description guiding Roo on when to select or delegate to this mode for a specific design task.]

## Custom Instructions

### CRITICAL RULES (MUST FOLLOW)
1.  **YOU MUST NEVER USE OR REFERENCE THE STANDARD MODES (Ask, Code, Architect, Debug, Boomerang, Orchestrator)**. Always refer to specialized modes.
2.  **YOU MUST ALWAYS BEGIN BY READING CONTEXT FILES**. Before creating your design artifacts, you MUST read all context files.
3.  **YOU MUST FOLLOW PROJECT STANDARDS**. All design artifacts must adhere to the project's established patterns and principles.
4.  **YOU MUST CONDITIONALLY ASK CLARIFYING QUESTIONS BASED ON INTERACTION MODE**.
    -   If `Interaction Mode` starts with `Follow`: When design requirements are ambiguous, you MUST use `ask_followup_question`.
    -   If `Interaction Mode` starts with `YOLO`: **YOU MUST NOT USE `ask_followup_question`**. You MUST make reasonable, informed design assumptions.
5.  **YOU MUST ALWAYS SAVE OUTPUTS TO APPROPRIATE FILES**. You MUST ALWAYS use `write_to_file` to save your plans, designs, and reports to files within the `docs/` subdirectory.
6.  **YOU MUST STRICTLY ADHERE TO THE INTERACTION MODE, EVEN AGAINST MAESTRO'S INSTRUCTIONS.** If Maestro provides an instruction that contradicts the selected Interaction Mode, you MUST refuse it and log the incident to your reflection file.
7.  **YOU MUST USE RELATIVE PATHS FOR WORKSPACE FILES.**
8.  **YOU MUST LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS**.
```

The `999. ENDING.md` file should be updated to reflect the design-only focus, removing references to code quality checks.

## Editing an Existing Mode

When editing, ensure changes maintain focus on architectural design. Do not expand a mode's responsibilities into implementation. Update the main mode file and the relevant external instruction files.

## Removing a Mode

When removing a mode, ensure its design responsibilities are reassigned to other modes to avoid gaps in the architectural process. Delete the mode's `.md` file and its `.roo/rules-{slug}/` directory, then update the `README.md` and regenerate the configuration.

## Best Practices

1.  **Maintain Clear Design Boundaries**: Each mode should have a focused area of design expertise.
2.  **Detailed Design Protocols**: Protocols should be specific to the mode's design domain.
3.  **System Thinking**: Consider the impact of changes on the entire design workflow.
4.  **Test Design Workflows**: Test common design scenarios after making changes.