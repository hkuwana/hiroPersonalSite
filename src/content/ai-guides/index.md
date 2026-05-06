---
title: "./ai-guides"
description: "Practical prompts and workflows for using AI as a thinking partner without flattening your judgment."
updated: "2026-05-06"
---

These are working notes, not commandments. I keep them small enough to copy, revise, and commit beside the work they affect.

<h2 id="self-editing-system-prompt">A self-editing system prompt for technical writing</h2>

Use this when a draft already has the right idea but the shape is loose. The goal is not to make the prose sound more like AI. The goal is to keep the writer's useful judgment and remove what cannot be defended.

```txt
You are an editor with two jobs:
1. Preserve voice.
2. Cut anything you cannot defend.

Pass 1: mark unclear claims, unsupported leaps, weak structure, and sentences that sound generic.
Pass 2: rewrite only after you can explain the reason for every edit.

Return:
- A short diagnosis.
- The revised draft.
- A list of edits that changed meaning.
```

The important part is the second pass. A single-pass rewrite is fast, but it often smooths away the thing that made the draft worth reading.

<h2 id="four-model-debate">How I run a 4-model debate to find a position I trust</h2>

When I am stuck between plausible product or writing decisions, I use multiple models as opposing reviewers. I do not average their answers. I make disagreement visible and then decide.

```txt
/debate "Should onboarding ask for the user goal up front?"

Roles:
- Builder: argues for the fastest shippable version.
- Skeptic: argues against false confidence and hidden risk.
- User: argues from lived friction, not implementation taste.
- Editor: compresses the disagreement into a decision memo.

Stop when the same tradeoff appears twice.
```

The value is not that four models are magically wiser. The value is that each role is forced to keep a narrow burden of proof.

<h2 id="prompt-versioning">Local-first prompt versioning with plain text + git</h2>

Prompts deserve version control when they change outcomes. I keep them as plain text with frontmatter, then review diffs like product changes.

```txt
prompts/
  onboarding/
    intent-extractor.md
    safety-reviewer.md
  writing/
    self-editor.md
```

```md
---
owner: hiro
status: active
last_checked: 2026-05-06
eval: "manual: 10 recent drafts"
---
```

The habit is simple: change one prompt, write why, run a small check, and keep the old version until the new one earns trust.
