# Jira Issue Tracking Workflow Integration

This document outlines how Jira issue tracking is integrated into our development workflow, managed by the Maestro orchestrator and executed by specialized modes.

## 1. Core Principles

- **Ticket Before Code:** All development work requires a corresponding Jira ticket.
- **Status Accuracy:** Jira statuses must reflect the real-time state of work.
- **Traceability:** Clear links must exist between Jira tickets, code branches, commits, and PRs.
- **Defined Completion:** Tickets are marked 'Done' only after meeting all acceptance criteria, passing tests, and updating documentation.

## 2. Project Key Management

- **Detection/Prompting (Maestro):** Maestro attempts to find `JIRA_PROJECT_KEY` in `.env` or `.jira`. If not found, prompts the user.
- **Storage (Maestro):** The key is stored in `/docs/project-management/project-context.md` and tracked for active requests in `/docs/project-management/workflow-state.md`.
- **Propagation (Maestro):** The key is included in the context for any delegated task requiring Jira interaction.

## 3. Ticket Lifecycle

### 3.1. Ticket Creation

- **Responsibility:** Information gathered by `Strategist` (or `Maestro`), creation delegated to `GitMaster` (or potential `JiraManager`).
- **Process:**
    1. Need identified.
    2. Required fields gathered (see section 4). Relationships identified.
    3. Maestro creates task context file.
    4. Maestro delegates creation to `GitMaster` via `new_task`.
    5. `GitMaster` uses `jira-server.create_issue` tool.
    6. `issueKey` reported back to Maestro.
    7. Maestro records `issueKey` in `workflow-state.md`.

### 3.2. Starting Work ("In Progress")

- **Responsibility:** `Maestro` delegates update to `GitMaster`.
- **Process:**
    1. Maestro delegates implementation task.
    2. Maestro delegates Jira status update task to `GitMaster`.
    3. `GitMaster` uses `jira-server.update_issue` to set status to 'In Progress'.

### 3.3. Development (Branches, Commits, PRs)

- **Branches (`GitMaster`):** Must include `issueKey` in branch names (see `/docs/standards/code-standards.md`).
- **Commits (Coding Modes):** Must include `issueKey` in commit messages (see `/docs/standards/code-standards.md`).
- **Pull Requests (`GitMaster`):** Must reference `issueKey`(s) in PR descriptions.

### 3.4. Ticket Completion ("Done")

- **Responsibility:** `Maestro` delegates final update after QA Protocol completion.
- **Process:**
    1. Implementation complete.
    2. Maestro initiates QA Protocol (Reviews, Testing, Doc Updates).
    3. All QA steps must pass/complete successfully.
    4. Maestro delegates final Jira update task to `GitMaster`.
    5. `GitMaster` uses `jira-server.update_issue` to set status to 'Done'.
    6. Maestro updates `workflow-state.md`.

## 4. Required Fields (Based on Issue Type)

- **Story:**
    - Acceptance criteria
    - Parent Epic link (if applicable)
    - User-focused description ("As a..., I want..., so that...")
- **Bug:**
    - Steps to reproduce
    - Expected behavior
    - Actual behavior
- **Task:**
    - Clear definition of done
- **Epic:**
    - Business objective/goal
    - High-level scope
    - Success metrics/KPIs
    - Dependencies
    - Estimated timeline

## 5. Issue Linking & Hierarchy

- Relationships identified by `Strategist`/`Visionary`.
- Linking information included in creation delegation message by Maestro.
- `GitMaster` uses `epic-link` custom field or `jira-server.create_issue_link` tool during creation.

## 6. Tool Usage (`jira-server` MCP)

- `create_issue`: For creating new tickets.
- `update_issue`: For updating status and other fields.
- `create_issue_link`: For linking related issues.
- `get_issues`, `get_user`: For context gathering if needed.

## 7. Related Documentation

- `/docs/project-management/project-context.md` (Stores Project Key)
- `/docs/project-management/workflow-state.md` (Tracks ticket IDs/status per task)
- `/docs/standards/code-standards.md` (Branching and commit message conventions)