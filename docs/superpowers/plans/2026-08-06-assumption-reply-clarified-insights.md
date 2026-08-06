# Assumption Reply → Clarified Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Investigate with Reply; attach assumptions to composer context; on clarify, rewrite insights and archive the prior response badge.

**Architecture:** Discriminated `AttachedContextItem` (chart | assumption). `replyToAssumption` adds a chip. `submitQuestion` detects assumption context, archives the source turn, and resolves a clarification answer mock. Confidence badge supports `archived`.

**Tech Stack:** React, TypeScript, existing ResearchContext / mockData patterns.

---

### Task 1: Types + mock clarification answer
### Task 2: Reducer archive + assumption context
### Task 3: ResearchContext reply + submit path
### Task 4: UI — Reply, chips, Archived badge, remove Investigate
### Task 5: Typecheck + smoke
