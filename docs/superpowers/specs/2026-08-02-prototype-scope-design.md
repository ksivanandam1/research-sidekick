# Prototype Scope — Tomoro Insights Research Sidekick

## Overview

**Product:** Tomoro Insights — in-context research & explanation panel for analyst workflows  
**Persona:** R. Alvarez, Revenue Analyst  
**Job to be done:** "When a KPI moves unexpectedly right before a leadership review, I need a fast, credible explanation — with evidence I can point to — so I can brief my VP without spending an afternoon cross-referencing Finance, Salesforce, and Slack myself."

This document defines what gets built vs. mocked in the prototype. The scope rule: **build/polish whatever makes the 7-stage journey (Notified → Inquire → Analyse → Verify → Probe & Drill Down → Review & Export → Monitor) feel real and complete; keep any actual AI/data/backend work mocked.**

Build against the **In Scope** list below. Anything under **Out of Scope** should stay mocked, stubbed, or absent — do not implement it.

---

## In Scope

1. **Notification & anomaly surfacing**
   - Proactive anomaly flagging on KPI cards with a direct path into asking about it
   - Extend the "ask about it" shortcut to all KPIs with anomalies, not just Revenue and Churn
   - Pre-fill the query so moving from "notified" to "inquire" is one click

2. **Query & context attachment**
   - Users can attach multiple sources/charts to a single question (e.g., Revenue + Churn together)
   - The agent determines which attached context is relevant rather than requiring the user to manually scope each piece
   - Attached context stays visible for the duration of the question so the user always knows what's included

3. **Stream of thought**
   - A visible, step-by-step trace of what the agent checked before answering (what was queried, what was found)
   - Each step shows a clear state: pending/running/complete
   - Collapsible to a one-line summary once the response is ready, expandable for review
   - Actual text describing what happened (e.g., "Queried Salesforce — found 3 closed-lost deals") rather than abstract stage labels

4. **Multi-source citations**
   - A single claim in the answer can cite more than one source (inline, per-claim)
   - Each citation carries enough metadata (source name, type) for the user to judge relevance at a glance
   - Citations are clickable/interactive to show more context about the source

5. **References & permissioning**
   - A full list of all sources considered in building the answer, available for the user to review
   - Includes sources the user *can* access (available to verify) and sources they *cannot* (clearly marked as inaccessible, not hidden)
   - The agent never cites or surfaces content outside the user's permissions, and when a source is inaccessible, that limit is stated explicitly rather than silently omitted
   - Enterprise access control is non-negotiable: it must always be clear what's off-limits and why

6. **Drill-down & nested investigation**
   - Clicking "investigate" on an open question spawns a nested thread
   - Nested thread carries breadcrumb navigation back to the parent context
   - Visual sense of nesting depth so users don't lose orientation after multiple levels

7. **Controls**
   - A way to stop a response mid-generation
   - Voice input indicated as a planned capability, with no functional speech-to-text behind it
   - Both remain available for the full duration of a response, not just at the start

8. **Review & export**
   - Nothing leaves the panel without human approval and review
   - Export review modal allows editing before copying/sharing
   - The parts of a draft most likely to need judgment (assumptions, restricted-source notes) are surfaced/highlighted ahead of the rest so the review doesn't feel like re-reading identical text each time

9. **Monitor & saved checks**
   - Ability to save an investigation as a repeatable check for future quarters
   - A durable, revisitable record of saved checks (not just a one-off toast confirmation)
   - Saved checks surface in a dedicated location so the save action feels persistent

---

## Out of Scope

1. **Real anomaly detection**
   - No statistical or ML-driven anomaly flagging; anomalies are pre-set in mock data
   - The "anomaly" is a constant in the dataset for demonstration purposes

2. **Real retrieval & reasoning**
   - No actual querying of Finance/Salesforce/Slack systems
   - No real LLM-driven synthesis or relevance ranking
   - Answers remain scripted/mocked; the agent's reasoning is deterministic and pre-authored

3. **Real access-control enforcement**
   - No live entitlements/permissions systems
   - "No access" labels on restricted sources are scripted per source, not derived from a real permission check
   - All permission logic is mocked and hardcoded for demonstration

4. **Real voice input**
   - No speech-to-text or functional voice interaction
   - Voice mode exists as a UI affordance/signal only, indicating a planned future capability

5. **Real monitoring & alerting**
   - No scheduled jobs or notifications that actually fire later
   - "Save as a repeatable check" creates a record but doesn't automatically re-run or alert
   - No watch conditions or trigger-based re-execution

6. **Persistence, accounts & multi-user state**
   - No real backend, database, or authentication system
   - State is session-only; refreshing the page resets the experience
   - Single-user prototype; no multi-user collaboration or role-based access layers

7. **Production concerns**
   - No performance optimization at scale
   - No accessibility audit (a11y) or comprehensive cross-browser testing
   - No analytics/telemetry instrumentation
   - No error handling for edge cases in real systems

---

## Key Design Principle

The prototype succeeds when a reviewer can see the full 7-stage journey play out and believe: *"This is how an analyst would work with this system to build and verify a credible insight under deadline pressure."* 

Every in-scope item directly supports that narrative. Every out-of-scope item is either a backend concern (real AI/data) or a production concern (performance, scale, cross-platform), and lives in a future phase.
