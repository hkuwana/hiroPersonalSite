---
title: "On Building for Decades"
date: "2025-12-04"
description: "Why simplicity wins in the long run when building personal infrastructure."
---

When I started thinking about how to write essays online, I looked at what has survived.

Paul Graham's essays have been online since 1995. They still work. They're still readable. The URLs haven't changed. There's no JavaScript required to read them.

Meanwhile, countless blogs built on WordPress, Medium, Ghost, and whatever the platform du jour was have disappeared, migrated, broken, or become unreadable due to paywall changes and platform pivots.

## The Lesson

The things that last are simple:

1. **Plain text files** - HTML, Markdown, and plain text have outlasted every database schema and CMS architecture ever built.

2. **Flat file structures** - A folder of files is easier to understand, backup, and migrate than any database.

3. **Minimal dependencies** - Every dependency is a liability. The fewer moving parts, the fewer things that can break.

4. **Stable URLs** - Cool URIs don't change. Pick a URL structure you can commit to forever.

## What This Means in Practice

This essay you're reading is a Markdown file in a folder. That's it. No database. No CMS. No admin panel.

If SvelteKit disappears tomorrow, I can move these files to any static site generator, or just serve them as raw HTML. The content is portable because it's just text.

The styling is minimal because minimal styling ages well. Look at Craigslist. Look at Hacker News. Look at any site that's been around for 20+ years. They're not beautiful, but they're readable and they work.

## The Tradeoff

Yes, I lose some features:
- No comments (but do I want to moderate spam forever?)
- No analytics dashboard (but PostHog handles what I need)
- No fancy image galleries (but do essays need them?)
- No tagging or categorization (but a chronological list works fine)

What I gain is more valuable: **confidence that this will still work in 2045**.

When I write, I want to focus on the ideas, not on fighting with some CMS or worrying about whether my platform will still exist. Plain files in a git repo give me that peace of mind.

## Starting Simple

If you're building something you want to last, start with the simplest thing that could possibly work:

- A folder of Markdown files
- A static site generator (any will do)
- A domain you own
- Git for version control

You can always add complexity later. You can never easily remove it.
