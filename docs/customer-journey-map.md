# Customer Journey Map — "Show Your Working" Research Sidekick

**Product:** Tomoro Insights — in-context research & explanation panel (Brief 4: Enterprise "Analyst research sidekick")
**Scope:** The end-to-end experience of an analyst investigating a KPI anomaly, verifying the agent's reasoning, and sharing a credible explanation — as implemented in this prototype (`src/`).

This map is grounded in the actual mock, not a generic funnel: the "product" is a single in-context feature used repeatedly inside an existing analytics workspace, and every step is a handoff between the system and the human, not a one-sided funnel. Stages are adapted accordingly (see [Instructions](#note-on-adapted-stages) below).

---

## 1. Persona

**R. Alvarez — Revenue Analyst, Tomoro Insights** *(the persona already seeded in the sidebar)*

**Job to be done:** *"When a KPI moves unexpectedly right before a leadership review, I need a fast, credible explanation — with evidence I can point to — so I can brief my VP without spending an afternoon cross-referencing Finance, Salesforce, and Slack myself."*

**Context (from the brief):**
- Desktop-based, several tabs open (dashboard, Salesforce, Slack, email), working against a deadline (QBR/leadership review).
- Trusts data, not prose — first question on any claim is "where did that come from?"
- Has partial context: knows the numbers, not necessarily the underlying deals, tickets, or Slack threads behind them.
- Needs speed *and* depth — a fast wrong answer is worse than a slightly slower right one.
- Wants a repeatable process, not a one-off answer, since the same kind of question recurs every close.

---

## 2. Journey Stages

<a id="note-on-adapted-stages"></a>
*Note on adapted stages: this feature is invoked inside an existing platform the analyst already uses daily, so there's no real "acquisition" or "onboarding" in the funnel sense. Instead, each stage below is led by the system, the human, or both — reflecting that the agent is meant to be a proactive collaborator, not a tool that just waits to be queried.*

| # | Stage | Who leads | Description |
|---|---|---|---|
| 1 | **Notified** | System | The dashboard proactively flags the Q3 revenue dip before the analyst goes looking for it |
| 2 | **Inquire** | Human | Analyst asks the agent to explain it, attaching one or more charts as context |
| 3 | **Analyse** | Human + System | Analyst frames the question with the right business context; agent ingests it and returns a structured answer plus a suggested next check |
| 4 | **Verify or validate** | Human + System | System labels fact vs. assumption vs. open question; analyst checks citations and confirms or challenges assumptions |
| 5 | **Probe & drill down** | Human | Analyst investigates an open question in a nested thread, without losing the parent context |
| 6 | **Review & export** | Human | Analyst reviews, edits, and exports the finding to share with executive stakeholders |
| 7 | **Monitor** | Human + System | Analyst sets up ongoing tracking so a change in Q4 surfaces on its own — closing the loop back to **Notified** |

**This is a loop, not a funnel.** Stage 7 (Monitor) is designed to feed the *next* Stage 1 (Notified) — the same anomaly-watching mechanism that flagged the Q3 dip should be what flags whatever happens in Q4. That closed loop is what turns this from a one-off Q&A tool into an ongoing collaboration, and it's the piece most worth protecting as the feature matures (see Stage 7 below — it's also the stage furthest from being real today).

---

## 3. Stage-by-Stage Detail

### Stage 1 — Notified *(System leads)*

- **Touchpoints:** Amber anomaly badge on the `KpiCard` (e.g. *"Q3 dip"*); highlighted anomaly point in the sparkline.
- **User actions:** Opens the dashboard for a routine check-in ahead of a review — the flagged card is what catches their attention, rather than the analyst deliberately hunting for problems.
- **Thoughts & questions:** *"Is that a real dip, or is the system flagging routine noise? Do I need to explain this in tomorrow's review?"*
- **Emotions:** 😐 Neutral scanning → 😟 mild concern once the anomaly registers — with a flicker of relief that the system caught it rather than the analyst spotting it buried in a wall of numbers.
- **Pain points / challenge:** This is only proactive in the sense of "waiting for you when you arrive" — it's still confined to the dashboard page. A collaborator that's genuinely proactive would surface this a layer higher (a sidebar badge, a digest, an alert) so the analyst is notified *before* they even open the tool, not just once they're already looking at the right card.
- **Opportunities:** Keep the flag specific ("Q3 dip," not "Anomaly detected"). Consider elevating it beyond the chart card — this is the difference between "Notified" and merely "noticeable."

### Stage 2 — Inquire *(Human leads)*

- **Touchpoints:** *"Add to chat"* button on the card; *"Q3 dip · ask about it"* shortcut; Research panel sliding open; `ContextTray` chip; empty-state copy *("Nothing attached yet")*.
- **User actions:** Clicks the anomaly shortcut (pre-fills the question) or clicks "Add to chat" and types their own question; can attach a second KPI (e.g. Churn) to ask a cross-metric question.
- **Thoughts & questions:** *"Will this actually save me time, or will I end up double-checking everything anyway?"*
- **Emotions:** 🙂 Cautiously optimistic — low-commitment action (one click, reversible).
- **Pain points:** The follow-up input is disabled with a nudge ("Attach a chart to ask a question…") until context is attached — correct for guiding first-time use, but could feel like an extra step under deadline pressure.
- **Opportunities:** The anomaly shortcut that pre-fills the question is the biggest friction-remover here — it collapses "notified → ask" into one click. Worth extending to every KPI with an anomaly, not just Revenue and Churn.

### Stage 3 — Analyse *(Human + System)*

- **Touchpoints:** `StageTimeline` (**Analysing → Retrieving → Citing → Drafting → Ready**); skeleton lines during drafting; typewriter-animated summary; "Suggested next check" callout (`Compass` icon) once ready.
- **User actions:** Frames the question with the right business context before the pipeline runs — e.g. attaching Revenue alone versus Revenue *and* Churn together changes the depth of the answer (`resolveAnswer` only returns the combined, cross-metric read when both are attached) — then watches the pipeline advance and reads the summary as it types out.
- **Thoughts & questions:** *"Did I attach enough context for this to actually explain the dip, not just describe it? Retrieving — from where?"*
- **Emotions:** 😌 Reassured by visible progress rather than a spinner; 🧐 a little self-checking — "am I asking this the right way?" — since the answer is only as good as the context supplied; 😑 mild impatience if a deadline is close.
- **Pain points / challenge:** The agent does the retrieval and synthesis, but it doesn't yet coach the human toward a better question. If the analyst attaches only Revenue when Churn is clearly related, they get a narrower answer with no signal that a broader question was available — the analysis is genuinely a two-way effort, but only the system's half is visible in the current build. The "Suggested next check" that lands at the end stays scoped to the next diagnostic step rather than a business action — worth protecting as the feature grows, even without "recommend" in the stage name.
- **Opportunities:** Named stages already deliver the brief's "show movement" requirement — this is the strongest existing trust cue in the flow. Add a light prompt — *"This also touches Churn, want to add it?"* — so the system actively helps the human ask a more complete question, rather than the human supplying context once and just waiting. Also add a rough ETA hint once retrieval runs against real (slower) systems.

### Stage 4 — Verify or validate *(Human + System)*

- **Touchpoints:** `AnswerSection` grouped into **Evidence / Assumptions / Open Questions**; `Badge` (colour + icon per kind, confidence label on assumptions); `CitationChip` → inline `SourcePreview`; restricted-source card (lock icon, "Request access"); `FeedbackControls` (👍 *"This looks right"* / 👎 *"Doesn't hold"*); "Re-checking…" state; revised-finding note (e.g. *"Revised based on your feedback — upgraded from Assumption to Evidence"*).
- **User actions:** Reads grouped findings; expands citation chips to sanity-check specific claims; notices one source (Legal contract) is restricted; thumbs-up an assumption that looks right, or flags one as not holding and watches the agent re-check and patch it.
- **Thoughts & questions:** *"Evidence I can cite directly — good. Which of these are assumptions I shouldn't repeat as fact? If I say this doesn't hold, will it actually redo the work, or just soften the wording?"*
- **Emotions:** 😊 Growing trust as sourced evidence appears — this is close to the **aha moment** (see below); 🤔 testing/skeptical when challenging an assumption; 😲 pleasantly surprised when the assumption is genuinely upgraded to sourced evidence (the mock's pricing-discount example) rather than just hedged language.
- **Pain points:** "Open source" links are placeholders (`#`) in the mock — a dead or slow link at exactly the moment of verification would undercut the credibility the rest of the flow builds. Restricted-source "Request access" gives no visibility into whether/when access is actually granted. A correction to one assumption doesn't automatically propagate to sibling findings elsewhere in the same answer that relied on it, which can leave the answer looking internally inconsistent.
- **Opportunities:** This stage is the feature's strongest trust mechanic and directly answers "where did that come from?" — protect the Evidence/Assumption/Unknown taxonomy and the visible re-check loop in any future redesign. Add a turnaround expectation to "Request access." Propagate corrections everywhere the assumption was used, not just where it was flagged.

### Stage 5 — Probe & drill down *(Human leads)*

- **Touchpoints:** *"Investigate"* button on Open Questions → `DrillDownThread` with `Breadcrumbs` (back to parent) and its own nested stage timeline + answer.
- **User actions:** Clicks "Investigate" on an open question (e.g. *"Why did the renewal rate drop specifically in APAC?"*); reads the nested answer; uses the breadcrumb to return to the parent thread.
- **Thoughts & questions:** *"Can I go one level deeper without losing where I started?"*
- **Emotions:** 🤔 Curious going in; 😌 reassured that the parent context is still one click away.
- **Pain points:** Each drill-down starts its own mini-analysis from scratch, and there's no visual sense of how many layers deep the analyst has gone — after two or three nested investigations, that could get disorienting.
- **Opportunities:** This directly answers the brief's "drill down without losing context" requirement — the nested-thread-plus-breadcrumb pattern is the right shape and should be preserved. Consider a depth indicator (e.g. "2 levels deep") once drill-downs can nest further.

### Stage 6 — Review & export *(Human leads)*

- **Touchpoints:** `PanelHeader` share icon (disabled until an answer is ready); `ExportReviewModal` (*"Nothing leaves this panel without your review"*); restricted-source warning banner in the draft; editable textarea; "Approve & Copy"; confirmation toast.
- **User actions:** Reviews the auto-drafted summary; edits a sentence to match their own voice; confirms restricted content was excluded; approves and copies it to paste into a deck or email for their VP.
- **Thoughts & questions:** *"Good — this didn't fire off to my VP without me looking. Is this going to feel like a safety net or a tax if I do it five times a day?"*
- **Emotions:** 😮‍💨 Relief that nothing leaves the panel unreviewed (directly answers the brief's "no export without review" constraint); slight friction if used many times in a day.
- **Pain points:** The review reads as a flat wall of text to re-check every time, even when nothing needs changing. "Export" today only means copying text to the clipboard — there's no persisted, attachable artifact (e.g. a PDF for the QBR deck) and no way to share the *charts* that were attached as context, so a stakeholder either has to trust the analyst's paraphrase or go open the dashboard themselves.
- **Opportunities:** Keep the review gate, but pre-highlight the one or two lines most likely to need a human check (assumptions, restricted-source notes) instead of the whole draft. Extend "export" toward a real point-in-time report and a shareable link that carries the attached charts, applying the same access checks to each chart's underlying scope as are applied to restricted sources today.

### Stage 7 — Monitor *(Human + System — the loop back to Notified)*

- **Touchpoints:** "Suggested next check" callout (`Compass` icon); *"Save as a repeatable check"* button (on both the per-KPI answer and the dashboard-level `DashboardSummaryModal`).
- **User actions:** Saves the Q3 investigation as a repeatable check for next quarter's close; in principle, would set a reminder or watch condition tied to the suggested next check (e.g. *"tell me if Enterprise churn in that cohort keeps rising in Q4"*).
- **Thoughts & questions:** *"Where does 'saved' actually live? Will something tell me if this changes, or do I have to remember to come back and check myself?"*
- **Emotions:** 🙂 Satisfied if the save feels durable and the system genuinely takes over the watching; 😕 deflated if it turns out to be a one-off confirmation toast.
- **Pain points / challenge:** This is the stage furthest from being real today, and it's the one that matters most for the "proactive collaborator" promise. "Save as a repeatable check" only shows a toast — there's no `Reports` surface to return to — and "Suggested next check" is inert text with nothing to click, assign, or attach a reminder to. As it stands, the loop back to **Notified** doesn't actually close: nothing will proactively tell the analyst if the APAC renewal rate or Q4 churn moves again.
- **Opportunities:** This is where "the AI proactively collaborating with the human" is made or broken. Give the next-check callout a real action — assign it, set a watch condition, pick a check-in date — and use it to trigger the *next* "Notified" moment next quarter. That's the difference between a single good answer and an ongoing collaboration.

---

## 4. Critical Moments

- **Aha moment:** The instant the first **Evidence** line appears (during "Citing," in the Analyse stage, before the prose summary even finishes drafting) — a concrete, sourced fact rather than a paragraph of confident-sounding text. This is where the feature proves it isn't "an oracle," per the brand direction.
- **Moments of truth:**
  1. Whether **Notified** actually catches something the analyst would otherwise have missed, or ever "cries wolf" on routine noise — trust in the flag itself compounds (or erodes) over repeated quarters.
  2. Flagging an assumption as **"Doesn't hold"** in Verify or Validate — does the agent visibly redo the work and change its mind, or just apologise?
  3. Hitting the **Review & export** gate right before a deadline — does it feel like protection or friction?
  4. Encountering a **restricted source** — does "Request access" resolve fast enough to matter for today's review, or become a dead end?
  5. Whether **Monitor** actually monitors — does anything come back to the analyst next quarter, or is "Save as a repeatable check" the last they hear of it?
- **Churn triggers:**
  - Long, unexplained "Analysing"/"Retrieving" stages with no sense of progress or ETA under real (non-mocked) latency.
  - A citation that doesn't actually lead anywhere real once "Open source" is wired to production systems.
  - Feedback that seems to be ignored (a correction that doesn't propagate to related findings in the same answer).
  - A "repeatable check" that turns out not to be — no durable place to find it again next quarter.
  - Monitor's promise going unfulfilled: if no reminder ever actually fires, the analyst eventually stops trusting that **Notified** will catch the next real issue either — because in a closed loop, the two stages sink or swim together.

---

## 5. Journey Map Summary

| Stage | Touchpoint | User Action | Emotion | Pain Point | Opportunity |
|---|---|---|---|---|---|
| Notified | Amber anomaly badge on KPI card | Opens the dashboard, the flagged card catches their eye | Mild concern, flicker of relief | Confined to the dashboard page, not a push alert | Elevate beyond the chart card (sidebar/digest-level) |
| Inquire | "Ask about it" shortcut / "Add to chat" | Attaches the chart(s), question pre-filled | Cautiously optimistic | Input disabled until context attached | Extend the one-click shortcut to every anomaly |
| Analyse | Stage timeline (Analysing→Retrieving→Citing→Drafting→Ready), "Suggested next check" | Frames the question with the right context, then watches labelled progress | Reassured, a little self-checking | No coaching toward a better question; no ETA under real latency | Suggest related charts to attach; add ETA cue |
| Verify or validate | Evidence/Assumption/Unknown groups, citations, thumbs up/down | Checks sources, confirms or challenges an assumption | Growing trust, then tested | Dead-link risk; no access-request ETA; corrections don't propagate | Protect the taxonomy; add ETA; propagate corrections |
| Probe & drill down | "Investigate" button, nested drill-down thread with breadcrumbs | Chases an open question without losing the parent thread | Curious, reassured | No sense of drill-down depth | Add a depth indicator for nested threads |
| Review & export | Export review modal, editable draft, "Approve & Copy" | Reviews, edits, approves before sharing with stakeholders | Relief, mild friction if frequent | Export is clipboard-text only; no shareable charts | Pre-highlight key lines; ship a real report + chart-inclusive share link |
| Monitor | "Suggested next check", "Save as a repeatable check" | Saves the check; (ideally) sets a watch condition for Q4 | Satisfied → deflated if not durable | No home for saved checks; next-check is inert text | Make the next-check actionable; feed it back into Notified |

---

## 6. Prioritized Recommendations

**Quick wins (highest impact, lowest effort):**
1. Add an access-turnaround expectation to the "Request access" flow for restricted sources — removes ambiguity at a key moment of truth.
2. Extend the pre-filled "ask about it" shortcut to every KPI with an anomaly, not just Revenue and Churn.
3. Pre-highlight the specific lines in the export review draft most likely to need human judgment (assumptions, restricted-source notes) instead of presenting the whole draft as equally in need of re-reading.
4. Add a light "want to also add [related chart]?" prompt during **Analyse** so the system helps the human ask a more complete question, rather than leaving the human's half of the analysis invisible — a small addition alongside the existing suggested-questions pattern.

**Bigger investments (highest long-term payoff):**
1. **Build a real Monitor stage** — turn "Suggested next check" into something assignable and trackable with a watch condition, and use it to drive the *next* "Notified" event. This is the single biggest gap between the current build and the brief's proactive-collaboration promise: right now the loop back to Stage 1 doesn't actually close.
2. Elevate **Notified** beyond the in-page badge (a sidebar or notification-level alert) so it's proactive in fact, not just in name.
3. Ship a **point-in-time exportable report** and a **shareable link that carries the attached charts** (not just text) for Review & Export — reusing the existing review-and-redact pattern, and applying the same access checks to a chart's underlying scope as are applied to restricted sources today.
4. Propagate corrections across sibling findings in **Verify or validate** — a correction should be visible everywhere the original assumption was relied on, not just where it was challenged.
5. Add realistic latency handling (partial progress, ETA hints) for **Analyse** so the trust built by visible stages doesn't erode once retrieval runs against real, slower systems.

---

## Further Reading

- [User Journey Mapping 101](https://www.productcompass.pm/p/user-journey-mapping-101)
- [Funnel Analysis 101: How to Track and Optimize Your User Journey](https://www.productcompass.pm/p/funnel-analysis)
- [Market Research: Advanced Techniques](https://www.productcompass.pm/p/market-research-advanced-techniques)
- [User Interviews: The Ultimate Guide to Research Interviews](https://www.productcompass.pm/p/interviewing-customers-the-ultimate)

---

*For a visual version, bring this table and the stage-by-stage detail into Miro or FigJam as swimlanes (stages as columns, touchpoint/emotion/pain-point/opportunity as rows). Since this journey loops (Monitor → Notified), consider drawing it as a circular diagram rather than a straight line, with the emotional curve plotted around the outside.*
