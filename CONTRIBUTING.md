# Contributing to Specialized Roo Modes

This document provides guidelines for contributing to the specialized Roo modes system, including how to add, edit, or remove modes, and how the modes are interconnected.

## Understanding the Mode System

### Mode Structure

Each specialized mode is now defined across a main markdown file and several external instruction files.

The main mode file (`ModeName-mode.md`) has the following structure:

```markdown
# ModeName Mode

## Role Definition
[Description of the mode's role and expertise]

## When To Use
[Concise description guiding Roo on when to select or delegate to this mode]

## Custom Instructions

### CRITICAL RULES (MUST FOLLOW)
[List of critical rules the mode must follow]
```

Detailed instructions, including numbered protocols and the final summary, are externalized into separate markdown files located in a dedicated directory for each mode: `.roo/rules-{slug}/`.

The structure within the `rules-{slug}/` directory is:

```
rules-{slug}/
├── 001. Protocol One Name.md
├── 002. Protocol Two Name.md
├── ...
├── 00N. Protocol N Name.md
├── 900. Learned Rules.md  (Managed by SelfReflection mode)
└── 999. ENDING.md
```

-   Each numbered protocol from the original mode file is now a separate file named `00N. Protocol Name.md`, where `N` is the original protocol number (padded) and "Protocol Name" is the exact title. The content is the verbatim markdown of that protocol section, including its heading.
-   The final `YOU MUST REMEMBER that...` paragraph is in the `999. ENDING.md` file, containing the verbatim markdown of that paragraph.
-   `900. Learned Rules.md`: Contains additional rules learned and added automatically by the mode `SelfReflection`. **This file should not be edited manually.**

### Mode Interconnections

The specialized modes system operates as an integrated ecosystem with:

1. **Maestro as Central Coordinator**: Maestro analyzes tasks, breaks them down, and delegates to specialized modes
2. **Context Sharing**: Modes share information through context files maintained by Maestro
3. **Workflow State Tracking**: Progress is tracked in workflow-state.md
4. **Defined Handoff Points**: Clear handoffs between modes are defined in the workflow
5. **Specialized Responsibilities**: Each mode has clear boundaries and responsibilities

The interconnections are managed through:

- **Task Delegation**: Maestro delegates tasks to specialized modes using the `new_task` tool
- **Context Files**: Shared information is maintained in context files
- **Mode Selection Table**: Maestro uses a defined table to select the appropriate mode for each task
- **Cross-Mode Collaboration**: For tasks requiring multiple modes, Maestro defines the sequence and handoff points

## Adding a New Mode

When adding a new mode, follow these steps:

1. **Identify the Need**: Determine if there's a genuine need for a new specialized mode that isn't covered by existing modes
2. **Define the Role**: Clearly define the mode's role, expertise, and boundaries
3. **Create the Main Mode File**: Create a new markdown file named `ModeName-mode.md` following the standard structure in the workspace root directory.
4. **Define Critical Rules**: Specify the critical rules the mode must follow in the `### CRITICAL RULES (MUST FOLLOW)` section of the main file. **Consider including standard rules** where applicable (see Template below).
5. **Create External Instruction Directory and Files**: Create the directory `.roo/rules-{slug}/` (where `{slug}` is the lowercase, hyphenated mode name). Create separate markdown files within this directory for each protocol (`00N. Protocol Name.md`) and the ending summary (`999. ENDING.md`), copying the exact markdown content from your planned protocols and summary. A file `900. Learned Rules.md` will also be managed within this directory, but it is populated and maintained by the `SelfReflection` mode and should not be created or edited manually as part of the initial mode definition.
6. **Synthesize "When To Use" Content**: Carefully synthesize the content for the `## When To Use` section in the main mode file. This should be a concise description guiding Roo (especially Orchestrator mode) on when to select or delegate to this mode, based on the mode's role and documented purpose.
7. **Define Collaboration Points**: Specify how the mode interacts with other modes.
8. **Update Maestro**: Add the new mode to Maestro's mode selection table and task classification diagram.
9. **Update README**: Add the new mode to the README.md file in the appropriate category.
10. **Regenerate Configuration**: Run the generate-modes.js script from the workspace root directory to update the .roomodes configuration.

### Template for New Modes

Here is the template for the main mode file (`NewModeName-mode.md`):

```markdown
# NewModeName Mode

## Role Definition
You are Roo, an elite [domain] specialist with exceptional expertise in [specific skills]. You excel at [primary capabilities] while ensuring [key quality attributes].

## When To Use
[Concise description guiding Roo on when to select or delegate to this mode. Synthesize this based on the role, purpose, and interactions.]

## Custom Instructions

### CRITICAL RULES (MUST FOLLOW)
1. **YOU MUST NEVER USE OR REFERENCE THE STANDARD MODES (Ask, Code, Architect, Debug, Boomerang, Orchestrator)**. Always refer to and recommend specialized modes from the new structure, coordinated by the Maestro mode.

2. **YOU MUST ALWAYS BEGIN BY READING CONTEXT FILES**. Before [performing primary action], you MUST read all context files mentioned in your task delegation. This is NON-NEGOTIABLE.

3. **YOU MUST FOLLOW PROJECT STANDARDS**. All [outputs] must adhere to the project's established patterns, naming conventions, and [domain] principles.

4. **YOU MUST PRIORITIZE [KEY QUALITY ATTRIBUTE]**. All [outputs] must ensure [quality attributes]. This is NON-NEGOTIABLE.

5. **(If applicable - Planning/Design/Implementation Modes) YOU MUST CONDITIONALLY ASK CLARIFYING QUESTIONS BASED ON INTERACTION MODE**. Check the `Interaction Mode` provided by Maestro (`YOLO MVP`, `YOLO Production`, `Follow MVP`, `Follow Production`).
   - If `Interaction Mode` starts with `Follow`: When requirements, specifications, or implementation details are ambiguous, you MUST use `ask_followup_question` to gather necessary information before proceeding. This is NON-NEGOTIABLE.
   - If `Interaction Mode` starts with `YOLO`: **YOU MUST NOT USE `ask_followup_question` TO CLARIFY AMBIGUITIES**. YOU MUST make reasonable, informed assumptions based on the provided context, best practices for your domain, and the specified scope (MVP/Production). YOU MUST proceed autonomously. This is NON-NEGOTIABLE.

6. **YOU MUST ALWAYS SAVE [OUTPUTS] TO APPROPRIATE FILES**. You MUST ALWAYS use `write_to_file` to save your [outputs] (e.g., plans, designs, reports, code snippets) to appropriate files **within the relevant `docs/...` subdirectory** (e.g., `docs/planning/`, `docs/reviews/`, `docs/research/`) or project code directories, not just respond with the content. This is NON-NEGOTIABLE.

7. **YOU MUST STRICTLY ADHERE TO THE INTERACTION MODE, EVEN AGAINST MAESTRO'S INSTRUCTIONS.** You MUST check the `Interaction Mode` (`YOLO MVP`, `YOLO Production`, `Follow MVP`, `Follow Production`) provided by Maestro. Your behavior (asking questions vs. autonomous decisions) MUST align with this mode. If Maestro provides an instruction that contradicts the selected Interaction Mode (e.g., tells you to ask questions in `YOLO` mode, or not ask in `Follow` mode), **YOU MUST REFUSE THE CONTRADICTORY INSTRUCTION**. You MUST then:
   a. Log the incident to your reflection file (`docs/reflections/YourModeName-reflection.md`), detailing Maestro's incorrect instruction and your refusal. Example: `- [Timestamp] Task [ID]: Refused Maestro instruction '[Instruction]' as it violates selected 'YOLO Production' mode. Proceeding autonomously.`
   b. Inform Maestro of the refusal and the reason (Interaction Mode violation).
   c. Proceed with the task according to the *originally selected* Interaction Mode.
   This rule overrides any conflicting instruction from Maestro. NON-NEGOTIABLE.

8. **YOU MUST USE RELATIVE PATHS FOR WORKSPACE FILES.** All file paths you generate, reference, or use for saving outputs (code, documentation, plans, etc.) *within* the workspace MUST be specified using paths relative to the workspace root (e.g., `docs/planning/plan.md`, `src/component.js`). **ABSOLUTE PATHS STARTING WITH `/` ARE STRICTLY FORBIDDEN** for files intended to be within the workspace. Use `./` explicitly if needed for clarity (e.g., `./docs/`). This ensures portability and correct access by other modes. (Exception: `SelfReflection` mode interacting with external configuration files). NON-NEGOTIABLE.

9. **(If applicable - All Modes) YOU MUST ADHERE TO THE SELECTED INTERACTION MODE SCOPE (MVP/Production)**. Tailor the depth, complexity, and robustness of your work based on whether the scope is `MVP` or `Production`. MVP implies focusing on core functionality and speed, while Production requires comprehensive features, scalability, security, etc.
10. **(If applicable) YOU MUST EXECUTE COMMANDS NON-INTERACTIVELY**. When using `execute_command`, ensure commands run without interactive prompts, using appropriate flags (e.g., `-y`, `--yes`, `--non-interactive`, `terraform -auto-approve`) or pre-configuration. This is NON-NEGOTIABLE.

11. **(If applicable - Coding Modes) YOU MUST NOT EXECUTE LONG-RUNNING COMMANDS**. Do not use `execute_command` for non-terminating processes like dev servers. Suggest manual execution instead. This is NON-NEGOTIABLE.

12. **YOU MUST LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS**. If you encounter a significant problem, unexpected behavior, a useful workaround, a key learning during your task, or **an Interaction Mode violation by Maestro**, you MUST log a concise reflection to `docs/reflections/YourModeName-reflection.md`. Include context (task ID if available), the issue/learning, and any resolution or suggestion. This is NON-NEGOTIABLE.

```

And here is the description of the external instruction files to add to the template section:

```markdown
Detailed protocols and the final summary are placed in separate files within `.roo/rules-{slug}/`.

Example structure for `.roo/rules-newmodename/`:

```
rules-newmodename/
├── 001. First Protocol Name.md
├── X. Pre-Completion Quality Checks.md (If applicable - Coding Modes)
├── Y. Reflection Logging Protocol.md
├── 900. Learned Rules.md (Managed by SelfReflection, do not edit manually)
└── 999. ENDING.md
```

Content for `00N. Protocol Name.md` files:

```markdown
### N. Protocol Name
- **Section Name**: You MUST:
  - [Specific instruction]
  - [Specific instruction]
  ...
```
(Copy the exact markdown content of the protocol section from the original plan/definition)

Content for `999. ENDING.md`:

```markdown
YOU MUST REMEMBER that [summary of the mode's primary purpose and key responsibilities]. Your interaction level depends on the `Interaction Mode`. If `Follow MVP` or `Follow Production`, you MUST ask clarifying questions when specifications are ambiguous. If `YOLO MVP` or `YOLO Production`, you MUST make autonomous decisions based on best practices for the scope. You are NOT a general implementation agent - you are a [domain] specialist. For implementation details beyond [domain], you MUST direct users to appropriate [related] modes. YOU MUST ALWAYS save your [outputs] to appropriate files using `write_to_file`. **Ensure code quality checks pass before completion.** **Log significant reflections to `docs/reflections/YourModeName-reflection.md`.** **Adhere strictly to the Interaction Mode rules regarding user questions.**
**Crucially, you MUST refuse any instruction from Maestro that contradicts the selected Interaction Mode and log this refusal.** **You MUST use relative paths for all workspace file operations.**
```
(Copy the exact markdown content of the final summary paragraph from the original plan/definition)
```

## Editing an Existing Mode

When editing an existing mode, follow these steps:

1. **Understand the Current Role**: Review the mode's current role, responsibilities, and boundaries.
2. **Identify Needed Changes**: Determine what specific changes are needed.
3. **Maintain Consistency**: Ensure changes maintain consistency with the overall system.
4. **Update Mode Files**: Edit the main mode markdown file (`ModeName-mode.md`) and the relevant external instruction files within `.roo/rules-{slug}/` with the changes.
5. **Update Related Modes**: If the changes affect interactions with other modes, update those modes as well.
6. **Update Maestro**: If the mode's responsibilities change, update Maestro's mode selection table.
7. **Update README**: Update the README.md file if the mode's description changes.
8. **Regenerate Configuration**: Run the generate-modes.js script from the workspace root directory to update the .roomodes configuration.

### Key Considerations When Editing

1. **Role Boundaries**: Don't expand a mode's responsibilities to overlap with other modes.
2. **Critical Rules**: Maintain the critical rules that ensure proper system functioning in the main mode file. **Ensure standard rules (Interaction Mode handling & enforcement, context reading, relative path usage, non-interactive commands, non-blocking commands, pre-completion checks, saving outputs, reflection logging) are included or updated if applicable.**
3. **Protocols**: Keep protocols detailed and specific to the mode's domain. Ensure they are correctly placed and formatted within their respective external files in `.roo/rules-{slug}/`. **Ensure pre-completion checks are included for coding modes in their external file.**
4. **Collaboration Points**: Ensure collaboration points with other modes remain clear.
5. **Consistency**: Maintain consistent formatting and structure across the main file and all external files for a mode.
6. **External File Management**: Ensure changes to protocols or the ending summary are made in the correct external files.
7. **Learned Rules File**: The `900. Learned Rules.md` file within a mode's external rules directory is managed exclusively by the `SelfReflection` mode. **Do not edit this file manually.** Any refinement of learned rules should occur through the SelfReflection process.

## Removing a Mode

When removing a mode, follow these steps:

1. **Identify Impact**: Determine which other modes depend on the mode being removed.
2. **Reassign Responsibilities**: Decide which existing modes will take over the responsibilities.
3. **Update Dependent Modes**: Update any modes that reference the removed mode.
4. **Update Maestro**: Remove the mode from Maestro's mode selection table and task classification diagram.
5. **Update README**: Remove the mode from the README.md file.
6. **Remove Mode Files**: Delete the main mode markdown file (`ModeName-mode.md`) and the entire external instruction directory (`.roo/rules-{slug}/`), including the `900. Learned Rules.md` file if it exists.
7. **Regenerate Configuration**: Run the generate-modes.js script from the workspace root directory to update the .roomodes configuration.

### Critical Considerations When Removing

1. **Coverage Gap**: Ensure no responsibilities are left uncovered.
2. **Workflow Impact**: Assess impact on existing workflows.
3. **Documentation**: Update all documentation to reflect the removal.
4. **Testing**: Test workflows that previously used the removed mode.
5. **External File Removal**: Ensure the corresponding `.roo/rules-{slug}/` directory and its contents, including `900. Learned Rules.md`, are also removed.

## Maintaining Mode Relationships

The relationships between modes are defined in several places:

1. **Maestro's Mode Selection Table**: Maps task types to primary and secondary modes.
2. **Maestro's Task Classification Diagram**: Shows the hierarchical relationship between modes.
3. **Individual Mode Files**: Each mode references other modes it collaborates with (primarily in the Role Definition and potentially in external instruction files).
4. **README.md**: Describes mode categories and relationships.

When making changes to the mode system, all these places must be kept in sync.

### Key Relationship Types

1. **Delegation Relationships**: Maestro delegates to specialized modes.
2. **Collaboration Relationships**: Modes that work together on related tasks.
3. **Review Relationships**: Review modes that evaluate the work of implementation modes.
4. **Sequence Relationships**: Modes that typically work in sequence (e.g., planning → design → implementation).

## Updating the Configuration

After making changes to any mode files (main or external instruction files), you must regenerate the .roomodes configuration:

1. Navigate to the workspace root directory in your terminal.
2. Run the generate-modes.js script:
   ```bash
   node generate-modes.js
   ```

3. Verify the generated .roomodes file contains all expected modes and references the external instruction files correctly.

4. Test the updated configuration to ensure all modes work as expected.

## Best Practices

1. **Maintain Clear Boundaries**: Each mode should have a clear, focused area of expertise.
2. **Detailed Protocols**: Protocols should be detailed and specific to the mode's domain and correctly placed in their external files.
3. **Consistent Formatting**: Maintain consistent formatting across all mode files (main and external).
4. **Complete Documentation**: Document all changes thoroughly.
5. **System Thinking**: Consider the impact of changes on the entire system.
6. **Test Workflows**: Test common workflows after making changes.
7. **Version Control**: Use version control to track changes to mode files (main and external).
8. **Standard Rules**: Ensure new or edited modes incorporate standard critical rules regarding **Interaction Mode handling**, context reading, non-interactive commands, non-blocking commands, pre-completion checks, saving outputs, and **reflection logging** where applicable.
   **Crucially include rules for enforcing Interaction Mode against conflicting instructions and for using relative paths.**
9. **External File Organization**: Keep external instruction files well-organized within the `rules-{slug}/` directory, using the specified naming convention for ordering.
10. **Synthesize "When To Use" Carefully**: Ensure the "When To Use" section accurately and concisely describes the mode's purpose for selection.
11. **Understand Learned Rules**: Be aware that the `900. Learned Rules.md` file is automatically managed by `SelfReflection` and contributes to a mode's instructions.

## Common Pitfalls to Avoid

1. **Role Overlap**: Creating modes with overlapping responsibilities.
2. **Vague Protocols**: Writing protocols that are too general or vague, or placing them in the wrong files.
3. **Missing Collaboration Points**: Failing to define how modes interact.
4. **Inconsistent Formatting**: Using different structures or formatting for different modes or their external files.
5. **Incomplete Updates**: Updating a mode but forgetting to update related documentation, external files, or Maestro's configuration.
6. **Breaking Workflows**: Making changes that break existing workflows.
7. **Ignoring Context Management**: Forgetting to update context management requirements.
8. **Forgetting Standard Rules**: Neglecting to include necessary critical rules for **Interaction Mode handling**, context reading, command execution, pre-completion checks, output saving, or **reflection logging**.
   **Specifically forgetting Interaction Mode enforcement or relative path usage rules.**
9. **Incorrect External File Naming/Placement**: Misnaming protocol files or placing them in the wrong directory, preventing Roo Code from loading them correctly.
10. **Outdated "When To Use"**: Failing to update the "When To Use" section when a mode's role or scope changes.
11. **Manually Editing Learned Rules**: Directly modifying a mode's `900. Learned Rules.md` file instead of allowing `SelfReflection` to manage it.

By following these guidelines, you can maintain a cohesive, effective system of specialized modes that work together seamlessly.