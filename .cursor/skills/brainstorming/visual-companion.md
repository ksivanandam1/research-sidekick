# Visual Companion — Detailed Guide

The companion is just an HTML file you generate and open in a browser tab. No frameworks, no servers, no build step.

## Mechanism

1. Write a single self-contained HTML file (inline `<style>` and `<script>`, no external dependencies) that shows the mockup, diagram, or comparison.
2. Save it under `docs/superpowers/visuals/<topic>-<n>.html`.
3. Open it as a local file in the browser tab:
   - Navigate to the file (`file:///absolute/path/to/file.html`).
   - Take a screenshot or snapshot so you also have visual confirmation of what was rendered.
4. Ask the specific visual question in your chat message — the HTML file itself should not contain the question, just the visual.
5. Wait for the user's response before moving to the next question.

## Editing vs. creating new files

- **Refining the same visual** (user reacted, wants a tweak): edit the existing HTML file in place and re-navigate to reload it.
- **New question or new comparison**: create a new numbered HTML file so prior visuals stay available for reference.

## Content guidelines

- **Mockups**: use realistic dimensions and real copy (not lorem ipsum) where possible. Label sections clearly.
- **Comparisons**: lay out options side-by-side with CSS flexbox/grid, each clearly labeled (e.g. "Option A" / "Option B") so the user can react to each directly.
- **Diagrams**: prefer simple HTML/CSS boxes-and-arrows or inline SVG over pulling in a diagramming library.
- Keep it minimal — this is a communication aid for a conversation, not production code. Don't over-engineer it.

## Workflow checklist

```
- [ ] Write the self-contained HTML file
- [ ] Open/navigate to it in the browser tab
- [ ] Screenshot or snapshot to confirm it rendered as intended
- [ ] Ask the visual question in chat (not in the HTML)
- [ ] Wait for the user's response before proceeding
```
