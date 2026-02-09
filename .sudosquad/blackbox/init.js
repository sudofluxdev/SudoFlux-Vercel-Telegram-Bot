const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const MEMORY_FILE = path.join(process.cwd(), '.sudosquad/blackbox/HIVE_MIND.md');

/**
 * Ensures the Hive Mind exists.
 * If not, creates the template.
 */
function ensureHiveMind() {
    if (!fs.existsSync(MEMORY_FILE)) {
        console.log(chalk.yellow("⚠️ Blackbox not found. Initializing flight recorder..."));

        const template = `# 🧠 HIVE MIND (Central Memory)\n
> **"We remember everything. We optimize everything."**\n
This file is the **SINGLE SOURCE OF TRUTH** for the @SudoSquad HQ.\n
Every Operative must **READ** this file before acting and **UPDATE** it after acting.\n
\n
---
\n
## 🧬 PROJECT DNA
- **Status**: [INIT]
- **Stack**: [TBD]
- **Architecture**: [TBD]
- **Deployment**: [TBD]
\n
---
\n
## ⚡ ACTIVE SPRINT
**Goal**: [Describe the current high-level objective]
\n
| ID | Task | Owner | Status |
|----|------|-------|--------|
| 001 | Initialize SudoSquad Framework | @TheManager | [IN_PROGRESS] |
\n
---
\n
## 📚 KNOWLEDGE GRAPH (Decisions Log)
> *Record every major technical decision here. Do not let the user repeat themselves.*
\n
- **[DATE]**: System initialized in **HARD MODE**.
\n
---
\n
## 👥 EXECUTION LOG
> *Who did what? Accountability is key.*
- **@TheManager**: Hive Mind deployed. Waiting for orders from The Boss.\n`;

        fs.outputFileSync(MEMORY_FILE, template);
        console.log(chalk.green("✅ Hive Mind deployed successfully."));
    } else {
        console.log(chalk.blue("🧠 Hive Mind is active and monitoring."));
    }
}

module.exports = { ensureHiveMind };
