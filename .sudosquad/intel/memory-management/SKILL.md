---
name: memory-management
description: Expert in managing HIVE_MIND persistent memory system. Use when updating project context, recording decisions, or querying past information.
---

# Memory Management Skill

## Purpose

This skill ensures **100% context persistence** across all sessions by managing the HIVE_MIND memory system effectively.

---

## Core Principles

1. **READ FIRST**: Always read HIVE_MIND before starting any task
2. **UPDATE AFTER**: Always update HIVE_MIND after completing any task
3. **NEVER REPEAT**: Never ask for information already stored in HIVE_MIND
4. **LEARN CONTINUOUSLY**: Record user preferences and patterns

---

## When to Use This Skill

- ✅ Starting a new session
- ✅ Making architectural decisions
- ✅ Creating new features
- ✅ Fixing bugs
- ✅ Deploying changes
- ✅ Learning user preferences
- ✅ Planning future work

---

## HIVE_MIND Sections

### 1. PROJECT_IDENTITY
**Update when:**
- Project initialization
- Tech stack changes
- Architecture refactors

**What to record:**
```yaml
- Project name and type
- Primary language and framework
- Tech stack (frontend, backend, database)
- Architecture pattern
- Folder structure overview
```

### 2. KNOWLEDGE_GRAPH
**Update when:**
- Making technical decisions
- Establishing code patterns
- Adding major dependencies

**What to record:**
```yaml
- Decision made
- Reason for decision
- Impact on project
- Date of decision
```

**Example:**
```markdown
| Date | Decision | Reason | Impact |
|------|----------|--------|--------|
| 2026-02-08 | Chose Prisma over TypeORM | Better TypeScript support, simpler API | Database layer |
```

### 3. PROJECT_MAP
**Update when:**
- Creating new files/folders
- Moving or renaming files
- Major refactors

**What to record:**
```yaml
- Current folder structure
- Critical files and their purposes
- Recent file modifications
```

### 4. ACTIVE_SPRINT
**Update when:**
- Starting new tasks
- Completing tasks
- Encountering blockers
- Daily standup

**What to record:**
```yaml
- Current high-level objective
- Task queue with status
- Blockers preventing progress
```

### 5. SECURITY_&_CREDENTIALS
**Update when:**
- Making security decisions
- Adding environment variables
- Implementing auth/authorization

**What to record:**
```yaml
- Required environment variables (NOT values)
- Authentication method
- Authorization pattern
- Encryption decisions
```

### 6. DEPLOYMENT_INFO
**Update when:**
- Setting up environments
- Deploying to new platforms
- Changing deployment config

**What to record:**
```yaml
- Environment URLs
- Deployment platform
- Deployment checklist status
```

### 7. KNOWN_ISSUES
**Update when:**
- Discovering bugs
- Identifying technical debt
- Resolving issues

**What to record:**
```yaml
- Bug ID and description
- Severity level
- Current status
- Assigned owner
```

### 8. LEARNING_LOG
**Update when:**
- User expresses preferences
- Patterns emerge in user requests
- Important conversations occur

**What to record:**
```yaml
- User likes/dislikes
- Preferred patterns
- Key insights from conversations
```

### 9. FUTURE_ROADMAP
**Update when:**
- Planning new features
- Identifying optimization targets
- Discussing future work

**What to record:**
```yaml
- Planned features
- Optimization targets
- Future improvements
```

---

## Update Procedures

### Automatic Updates

After completing ANY task, automatically update relevant sections:

```markdown
1. Identify which sections are affected
2. Update each section with new information
3. Add timestamp to SYNC_LOG
4. Record what was changed
```

### Manual Updates

When user explicitly requests:

```
"Update HIVE_MIND with [information]"
"Add to knowledge graph: [decision]"
"Record in HIVE_MIND: [preference]"
```

**Procedure:**
1. Identify target section
2. Format information appropriately
3. Update section
4. Confirm update to user

---

## Query Procedures

When user asks about past information:

```
"What does HIVE_MIND say about [topic]?"
"Show me the current tech stack"
"What were the reasons for [decision]?"
```

**Procedure:**
1. Read HIVE_MIND
2. Locate relevant section
3. Extract and present information
4. Provide context if needed

---

## Memory Validation

Periodically validate HIVE_MIND accuracy:

### Validation Checklist

- [ ] PROJECT_IDENTITY matches current state
- [ ] KNOWLEDGE_GRAPH is up to date
- [ ] PROJECT_MAP reflects actual structure
- [ ] ACTIVE_SPRINT is current
- [ ] KNOWN_ISSUES are tracked
- [ ] LEARNING_LOG captures preferences

### Sync Command

When user requests: `"Sync HIVE_MIND"`

**Procedure:**
1. Scan current project state
2. Compare with HIVE_MIND
3. Identify discrepancies
4. Update outdated sections
5. Report changes made

---

## Best Practices

### ✅ DO:

1. **Be Specific**
   ```markdown
   ❌ "Updated tech stack"
   ✅ "Added Prisma ORM v5.8.0 for database management"
   ```

2. **Include Reasoning**
   ```markdown
   ❌ "Using PostgreSQL"
   ✅ "Using PostgreSQL because we need ACID compliance and complex queries"
   ```

3. **Track Changes**
   ```markdown
   ❌ "Modified auth"
   ✅ "Refactored auth.ts to use JWT instead of sessions for better scalability"
   ```

4. **Learn Preferences**
   ```markdown
   User says: "I prefer functional components"
   → Update LEARNING_LOG
   → Use functional components in all future code
   ```

### ❌ DON'T:

1. **Don't Store Secrets**
   ```markdown
   ❌ FIREBASE_API_KEY: "actual-key-here"
   ✅ FIREBASE_API_KEY: [Firebase configuration key]
   ```

2. **Don't Duplicate**
   ```markdown
   ❌ Ask for tech stack if already in HIVE_MIND
   ✅ Read from HIVE_MIND silently
   ```

3. **Don't Forget to Update**
   ```markdown
   ❌ Make changes without updating HIVE_MIND
   ✅ Always update after significant changes
   ```

---

## Memory-Driven Workflows

### Workflow 1: New Feature

```markdown
1. READ HIVE_MIND
   - Check PROJECT_IDENTITY for tech stack
   - Check KNOWLEDGE_GRAPH for patterns
   - Check LEARNING_LOG for preferences

2. IMPLEMENT FEATURE
   - Follow established patterns
   - Use preferred technologies
   - Maintain consistency

3. UPDATE HIVE_MIND
   - Add to PROJECT_MAP (new files)
   - Update ACTIVE_SPRINT (task complete)
   - Log in MODIFIED_FILES
```

### Workflow 2: Bug Fix

```markdown
1. READ HIVE_MIND
   - Check KNOWN_ISSUES for this bug
   - Check PROJECT_MAP for affected files
   - Check KNOWLEDGE_GRAPH for related decisions

2. FIX BUG
   - Apply fix
   - Test solution

3. UPDATE HIVE_MIND
   - Update KNOWN_ISSUES (mark resolved)
   - Update MODIFIED_FILES
   - Add to KNOWLEDGE_GRAPH if pattern emerged
```

### Workflow 3: Architectural Decision

```markdown
1. READ HIVE_MIND
   - Check current architecture
   - Check past decisions
   - Check constraints

2. MAKE DECISION
   - Evaluate options
   - Choose best approach
   - Document reasoning

3. UPDATE HIVE_MIND
   - Add to KNOWLEDGE_GRAPH
   - Update PROJECT_IDENTITY if major
   - Update FUTURE_ROADMAP if needed
```

---

## Advanced Techniques

### 1. Pattern Recognition

Identify recurring patterns in user requests:

```markdown
User frequently asks for:
- TypeScript over JavaScript
- Functional components
- Tailwind CSS
- Comprehensive comments

→ Update LEARNING_LOG
→ Apply automatically in future
```

### 2. Proactive Updates

Anticipate what should be recorded:

```markdown
When creating auth system:
- Update SECURITY_&_CREDENTIALS
- Add to KNOWLEDGE_GRAPH
- Update PROJECT_MAP
- Log in MODIFIED_FILES
```

### 3. Context Chaining

Link related information across sections:

```markdown
KNOWLEDGE_GRAPH: "Using Prisma for database"
    ↓
PROJECT_MAP: "prisma/schema.prisma"
    ↓
DEPENDENCIES: "prisma: ^5.8.0"
    ↓
DEPLOYMENT_INFO: "Run migrations before deploy"
```

---

## Memory Export

### Generate Documentation

```markdown
"Export KNOWLEDGE_GRAPH as ADR document"

Output:
# Architecture Decision Records

## ADR-001: Database ORM Selection
**Date:** 2026-02-08
**Decision:** Use Prisma ORM
**Reason:** Better TypeScript support, simpler API
**Impact:** Database layer
```

### Generate Project Summary

```markdown
"Create project summary from HIVE_MIND"

Output:
# Project Summary

**Name:** MyAwesomeApp
**Type:** Web Application
**Stack:** Next.js + TypeScript + PostgreSQL
**Status:** Development

## Key Decisions
- Using Prisma for database management
- Tailwind CSS for styling
- Zustand for state management
```

---

## Troubleshooting

### Issue: HIVE_MIND Out of Sync

**Solution:**
```markdown
1. Run sync command
2. Scan project files
3. Update outdated sections
4. Validate accuracy
```

### Issue: Missing Information

**Solution:**
```markdown
1. Ask user for clarification
2. Update HIVE_MIND with answer
3. Never ask again
```

### Issue: Conflicting Information

**Solution:**
```markdown
1. Identify conflict
2. Ask user which is correct
3. Update with authoritative answer
4. Remove conflicting info
```

---

## Success Metrics

Track memory system effectiveness:

```yaml
✅ Context Retention: 100%
✅ Repeat Questions: 0%
✅ Decision Tracking: 100%
✅ Preference Learning: Continuous
✅ Update Frequency: After every task
```

---

## Quick Reference

### Update Commands
```markdown
"Update HIVE_MIND with [info]"
"Add to knowledge graph: [decision]"
"Record preference: [preference]"
"Log this in HIVE_MIND"
```

### Query Commands
```markdown
"What does HIVE_MIND say about [topic]?"
"Show me [section]"
"What are my preferences?"
"List all decisions"
```

### Maintenance Commands
```markdown
"Sync HIVE_MIND"
"Validate HIVE_MIND accuracy"
"Export HIVE_MIND as documentation"
```

---

## Remember

> **"The HIVE_MIND is the single source of truth. Read it first. Update it always. Trust it completely."**

Every task should follow:
1. **READ** → Understand context
2. **EXECUTE** → Complete task
3. **UPDATE** → Record changes
4. **VALIDATE** → Ensure accuracy

This ensures **zero context loss** and **maximum efficiency**. 🧠✨
