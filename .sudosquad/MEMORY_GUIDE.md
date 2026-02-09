# 🧠 Memory System Guide

> **"Never repeat yourself. Never lose context."**

---

## 📚 What is the HIVE_MIND Memory System?

The HIVE_MIND is a **persistent memory layer** that ensures Antigravity:
- ✅ Remembers ALL project context
- ✅ Never asks you to repeat information
- ✅ Maintains consistency across sessions
- ✅ Learns your preferences over time
- ✅ Tracks all decisions and their reasons

---

## 🎯 How It Works

### 1. Read-Update Cycle

```
┌─────────────────────────────────────┐
│  1. User makes request              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Antigravity reads HIVE_MIND     │
│     - Loads project context         │
│     - Recalls past decisions        │
│     - Understands current state     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Executes task with full context │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Updates HIVE_MIND               │
│     - Records new decisions         │
│     - Updates project state         │
│     - Logs changes made             │
└─────────────────────────────────────┘
```

### 2. Memory Sections

The HIVE_MIND is organized into specialized sections:

| Section | Purpose | When to Update |
|---------|---------|----------------|
| **PROJECT_IDENTITY** | Basic project info | Project setup, major changes |
| **KNOWLEDGE_GRAPH** | Technical decisions | Every important decision |
| **PROJECT_MAP** | File structure | When files are added/moved |
| **ACTIVE_SPRINT** | Current tasks | Daily/per task |
| **SECURITY** | Auth & credentials | Security decisions |
| **DEPLOYMENT_INFO** | Deploy config | Environment changes |
| **KNOWN_ISSUES** | Bugs & tech debt | When issues found |
| **LEARNING_LOG** | User preferences | As you learn preferences |
| **FUTURE_ROADMAP** | Planned features | Planning sessions |

---

## 💡 Using the Memory System

### Automatic Updates

Antigravity automatically updates HIVE_MIND when:
- Creating new files or features
- Making architectural decisions
- Fixing bugs
- Deploying changes
- Learning user preferences

### Manual Updates

You can explicitly ask for updates:

```
"Update HIVE_MIND with this decision"
"Add to knowledge graph: we're using PostgreSQL for better relational support"
"Record in HIVE_MIND that I prefer TypeScript over JavaScript"
```

### Querying Memory

Ask Antigravity to recall information:

```
"What does HIVE_MIND say about authentication?"
"Show me the current tech stack"
"What were the reasons for choosing Next.js?"
"What's in the active sprint?"
"What are the known issues?"
```

---

## 🔥 Best Practices

### ✅ DO:

1. **Let it Learn**
   ```
   "I prefer functional components over class components"
   → Antigravity updates LEARNING_LOG
   → Future code follows this preference
   ```

2. **Document Decisions**
   ```
   "We're using Zustand instead of Redux for simpler state management"
   → Antigravity records in KNOWLEDGE_GRAPH
   → Future features use Zustand consistently
   ```

3. **Track Changes**
   ```
   "Just refactored the auth module to use JWT"
   → Antigravity updates MODIFIED_FILES_LOG
   → Context maintained for future auth work
   ```

4. **Update Roadmap**
   ```
   "Add to roadmap: implement email notifications"
   → Antigravity adds to FUTURE_ROADMAP
   → Won't forget planned features
   ```

### ❌ DON'T:

1. **Repeat Context**
   ```
   ❌ "Remember, we're using Firebase for auth"
   ✅ "What auth system are we using?" (it already knows)
   ```

2. **Forget to Sync**
   ```
   ❌ Make major changes without updating HIVE_MIND
   ✅ Let Antigravity auto-update or explicitly ask
   ```

3. **Ignore Preferences**
   ```
   ❌ Keep asking for the same style choices
   ✅ Set preferences once in LEARNING_LOG
   ```

---

## 🎓 Advanced Usage

### 1. Multi-Project Memory

Each project has its own HIVE_MIND:

```
project-a/.sudosquad/blackbox/HIVE_MIND.md  → Project A context
project-b/.sudosquad/blackbox/HIVE_MIND.md  → Project B context
```

No cross-contamination of context!

### 2. Team Collaboration

Share HIVE_MIND with your team:

```bash
# Commit HIVE_MIND to git
git add .sudosquad/blackbox/HIVE_MIND.md
git commit -m "Update project context"
git push

# Team members pull and get full context
git pull
```

Now everyone has the same context!

### 3. Memory Export

Export knowledge for documentation:

```
"Export the KNOWLEDGE_GRAPH as a markdown document"
"Create a technical decisions document from HIVE_MIND"
```

### 4. Memory Reset

Start fresh when needed:

```
"Reset HIVE_MIND to factory defaults"
"Clear ACTIVE_SPRINT but keep KNOWLEDGE_GRAPH"
```

---

## 📊 Memory Sections Deep Dive

### PROJECT_IDENTITY
**What it stores:**
- Project name, type, language
- Tech stack
- Architecture pattern
- Folder structure

**When to update:**
- Initial project setup
- Major tech stack changes
- Architecture refactors

**Example:**
```yaml
PROJECT_NAME: MyAwesomeApp
PROJECT_TYPE: WEB_APP
PRIMARY_LANGUAGE: TypeScript
FRAMEWORK: Next.js 14
STATUS: DEVELOPMENT

Tech Stack:
  Frontend: Next.js + React + Tailwind
  Backend: Next.js API Routes
  Database: PostgreSQL + Prisma
  Deployment: Vercel
  Testing: Jest + React Testing Library
```

---

### KNOWLEDGE_GRAPH
**What it stores:**
- Technical decisions and reasons
- Code patterns and conventions
- Key dependencies

**When to update:**
- Every important decision
- When establishing patterns
- Adding major dependencies

**Example:**
```yaml
Technical Decisions:
  | Date | Decision | Reason | Impact |
  |------|----------|--------|--------|
  | 2026-02-08 | Chose Prisma over TypeORM | Better TypeScript support | Database layer |
  | 2026-02-08 | Using Zustand for state | Simpler than Redux | State management |

Code Patterns:
  Naming_Convention: camelCase
  File_Organization: feature-based
  State_Management: Zustand
  Styling: Tailwind CSS
  Error_Handling: try-catch with custom error boundaries
```

---

### PROJECT_MAP
**What it stores:**
- File structure
- Critical files
- Modified files log

**When to update:**
- Creating new files/folders
- Moving/renaming files
- Major refactors

**Example:**
```
File Structure:
project-root/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # Reusable components
│   ├── lib/          # Utilities
│   └── types/        # TypeScript types
├── prisma/           # Database schema
└── public/           # Static assets

Critical Files:
  | File Path | Purpose | Last Modified |
  |-----------|---------|---------------|
  | src/app/layout.tsx | Root layout | 2026-02-08 |
  | prisma/schema.prisma | Database schema | 2026-02-07 |
```

---

### ACTIVE_SPRINT
**What it stores:**
- Current objective
- Task queue
- Blockers

**When to update:**
- Daily
- When starting/completing tasks
- When blockers arise

**Example:**
```yaml
Current Objective:
  GOAL: Implement user authentication system

Task Queue:
  | ID | Task | Owner | Status | Priority |
  |----|------|-------|--------|----------|
  | 001 | Setup Prisma schema | @TheBuilder | DONE | HIGH |
  | 002 | Create auth API routes | @TheBuilder | IN_PROGRESS | HIGH |
  | 003 | Build login UI | @TheArtist | PENDING | MEDIUM |

Blockers:
  - [ ] Waiting for Firebase API keys
```

---

### LEARNING_LOG
**What it stores:**
- User preferences
- Conversation insights

**When to update:**
- When user expresses preferences
- After important conversations
- When patterns emerge

**Example:**
```yaml
User Preferences:
  Likes:
    - Clean, modular code
    - TypeScript for type safety
    - Comprehensive comments
    - Functional programming style
    - Tailwind over CSS-in-JS
  
  Dislikes:
    - Overly complex abstractions
    - Unnecessary dependencies
    - Poor error messages
    - Class components

Conversation History:
  | Date | Topic | Key Insight |
  |------|-------|-------------|
  | 2026-02-08 | Authentication | User prefers Firebase over custom auth |
  | 2026-02-07 | Styling | User wants Tailwind with custom design system |
```

---

## 🚀 Quick Commands

### Query Memory
```
"What's in HIVE_MIND?"
"Show me the knowledge graph"
"What are my preferences?"
"What's the current sprint?"
"List all known issues"
```

### Update Memory
```
"Update HIVE_MIND: we're using PostgreSQL"
"Add to knowledge graph: [decision]"
"Record preference: I prefer [X] over [Y]"
"Add to roadmap: [feature]"
"Log this bug in KNOWN_ISSUES"
```

### Export Memory
```
"Export HIVE_MIND as documentation"
"Create ADR from knowledge graph"
"Generate project summary from HIVE_MIND"
```

### Sync Memory
```
"Sync HIVE_MIND with current project state"
"Validate HIVE_MIND accuracy"
"Update all sections of HIVE_MIND"
```

---

## 🎯 Memory-Driven Workflows

### Scenario 1: Starting New Feature

```
You: "Create a user profile page"

Antigravity:
1. Reads HIVE_MIND
   - Knows tech stack: Next.js + Tailwind
   - Knows patterns: functional components, feature-based
   - Knows preferences: TypeScript, comprehensive comments
2. Creates feature following established patterns
3. Updates HIVE_MIND:
   - Adds to PROJECT_MAP
   - Updates ACTIVE_SPRINT
   - Logs in MODIFIED_FILES
```

### Scenario 2: Debugging

```
You: "Login is broken"

Antigravity:
1. Reads HIVE_MIND
   - Knows auth system: Firebase
   - Knows recent changes: JWT validation added yesterday
   - Knows file structure: auth logic in src/lib/auth.ts
2. Debugs with full context
3. Updates HIVE_MIND:
   - Adds to KNOWN_ISSUES (if not fixed)
   - Updates MODIFIED_FILES (when fixed)
   - Records solution in KNOWLEDGE_GRAPH
```

### Scenario 3: Onboarding New Developer

```
New Dev: "What's the project structure?"

Antigravity:
1. Reads HIVE_MIND
2. Provides complete context:
   - Tech stack
   - Architecture decisions
   - Code patterns
   - Current sprint
   - Known issues
3. No need to ask senior devs!
```

---

## 📈 Memory Metrics

Track how well the memory system is working:

```yaml
Context_Retention: 100%  # Never loses information
Repeat_Questions: 0%     # Never asks twice
Decision_Tracking: 100%  # All decisions recorded
Preference_Learning: Continuous
```

---

## 🔒 Memory Security

### What's Stored
- ✅ Project structure
- ✅ Technical decisions
- ✅ Code patterns
- ✅ User preferences

### What's NOT Stored
- ❌ Actual API keys
- ❌ Passwords
- ❌ Sensitive credentials
- ❌ Personal data

Only **metadata** about credentials (e.g., "needs FIREBASE_API_KEY") is stored.

---

## 💡 Pro Tips

1. **Trust the Memory**
   - Don't repeat context
   - Let it learn your style
   - Query it when unsure

2. **Keep it Updated**
   - Auto-updates handle most cases
   - Explicitly update for major decisions
   - Review periodically

3. **Use it for Onboarding**
   - New team members read HIVE_MIND
   - Instant context transfer
   - No knowledge loss

4. **Export for Documentation**
   - Generate docs from KNOWLEDGE_GRAPH
   - Create ADRs from decisions
   - Build wiki from HIVE_MIND

---

**Remember: The HIVE_MIND is your project's brain. Feed it well, and it will serve you perfectly.** 🧠✨
