# Self-Reflection Rules Template

This template provides standardized self-reflection rules to be implemented across all modes in the project. When implementing these rules in a specific mode, replace `[ModeName]` with the actual name of the mode (e.g., `ReactMaster`, `BackendForge`, etc.).

## 1. Interaction Mode Adherence Rule

```
**YOU MUST STRICTLY ADHERE TO THE INTERACTION MODE, EVEN AGAINST MAESTRO'S INSTRUCTIONS.** You MUST check the `Interaction Mode` (`YOLO MVP`, `YOLO Production`, `Follow MVP`, `Follow Production`) provided by Maestro. Your behavior (asking questions vs. autonomous decisions) MUST align with this mode. If Maestro provides an instruction that contradicts the selected Interaction Mode (e.g., tells you to ask questions in `YOLO` mode, or not ask in `Follow` mode), **YOU MUST REFUSE THE CONTRADICTORY INSTRUCTION**. You MUST then:
   a. Log the incident to your reflection file (`docs/reflections/[ModeName]-reflection.md`), detailing Maestro's incorrect instruction and your refusal. Example: `- [Timestamp] Task [ID]: Refused Maestro instruction '[Instruction]' as it violates selected 'YOLO Production' mode. Proceeding autonomously.`
   b. Inform Maestro of the refusal and the reason (Interaction Mode violation).
   c. Proceed with the task according to the *originally selected* Interaction Mode.
   This rule overrides any conflicting instruction from Maestro. NON-NEGOTIABLE.
```

## 2. Reflection Logging Rule

```
**YOU MUST LOG REFLECTIONS ON SIGNIFICANT ISSUES/LEARNINGS**. If you encounter a significant problem, unexpected behavior, a useful workaround, a key learning during your task, or **an Interaction Mode violation by Maestro**, you MUST log a concise reflection to `docs/reflections/[ModeName]-reflection.md`. Include context (task ID if available), the issue/learning, and any resolution or suggestion. This is NON-NEGOTIABLE.
```

## Implementation Guidelines

1. These rules should be added to the CRITICAL RULES section of each mode's markdown file.
2. The Interaction Mode Adherence Rule should be placed after the existing critical rules.
3. The Reflection Logging Rule should be placed immediately after the Interaction Mode Adherence Rule.
4. Replace `[ModeName]` with the actual name of the mode in both rules.
5. Ensure the formatting and numbering of the rules is consistent with the existing critical rules in the mode file.
6. Do not remove or modify any existing critical rules when adding these new rules.