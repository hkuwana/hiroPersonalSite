---
title: "[FILL IN: Building X with AI - AI for Dummies #N]"
date: [YYYY-MM-DD]
series: "AI for Dummies"
episode: [N]
tags: [ai, tutorial, beginner-friendly, claude-code]
---

# [FILL IN: Building X with AI - AI for Dummies #N]

> **TEMPLATE INSTRUCTIONS**: This is your weekly template. Copy this file, fill in the bracketed sections, and publish to your blog. Delete this instruction block when done.

---

## Introduction

**[FILL IN: What motivated you this week? What problem were you trying to solve?]**

Example: "I wanted to automate email reminders for my language learning app so users stay engaged without me manually sending emails every week."

---

Welcome to Week [N] of **AI for Dummies**!

In this series, I share projects I'm building with AI tools—and show you exactly how to build them yourself, even if you've never coded before.

**What you'll learn today:**
- [FILL IN: Key learning 1]
- [FILL IN: Key learning 2]
- [FILL IN: Key learning 3]

**Time to complete:** About 1-2 hours (including setup)

**Cost:** Free (with free tiers of all services)

---

## What We're Building

**[FILL IN: Describe the feature in 1-2 sentences]**

Example: "An automated email system that runs on GitHub Actions, sends personalized reminders, and tracks user engagement."

**Why this is useful:**
- [FILL IN: Benefit 1]
- [FILL IN: Benefit 2]
- [FILL IN: Benefit 3]

**What makes this special:**
[FILL IN: What's interesting or unique about this approach?]

**[ADD: Screenshot or demo GIF of the finished feature]**

---

## Key Files from This Week

> **YOUR ACTUAL CODE**: List the files readers should pay attention to

**[FILL IN: List 3-5 key files from your project]**

Example:
- `.github/workflows/email-automation.yml` - The GitHub Action that runs weekly
- `src/lib/emails/campaigns/weekly-reminder.ts` - Email template and logic
- `src/routes/api/cron/send-reminders/+server.ts` - API endpoint triggered by cron
- `src/lib/server/db/schema/user-preferences.ts` - Database schema for email preferences

**[FILL IN: Link to your GitHub repo or specific commit]**

Example: "See the full code: [github.com/yourusername/yourrepo/commit/abc123](https://github.com/yourusername/yourrepo)"

---

## What You'll Need

Before we start, make sure you have:

<!-- Uncomment the services you're actually using this week -->

- [ ] A **GitHub account** (free) - [Sign up here](https://github.com/signup)
<!-- - [ ] A **Resend account** (free tier) - [Sign up here](https://resend.com/signup) -->
<!-- - [ ] A **Supabase account** (free tier) - [Sign up here](https://supabase.com) -->
- [ ] An **Anthropic API key** (free credits to start) - [Get one here](https://console.anthropic.com)
- [ ] **Node.js installed** (LTS version) - [Download here](https://nodejs.org)

**[FILL IN: Any other specific requirements for this week's project?]**

**Total setup time:** ~15 minutes

---

## Step 1: Set Up Your GitHub Repository

### Create the Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `[FILL IN: suggested-project-name]`
3. Description: "[FILL IN: One-line description]"
4. Keep it **Public** (so you can show it off!)
5. Check ✅ **Add a README file**
6. Click **Create repository**

### Clone It Locally

**Copy and paste this into your terminal:**

```bash
# Clone your new repository (REPLACE YOUR-USERNAME and PROJECT-NAME)
git clone https://github.com/YOUR-USERNAME/[FILL IN: project-name].git

# Navigate into it
cd [FILL IN: project-name]

# Verify you're in the right place
pwd
```

### Set Up Git Config (First Time Only)

If this is your first time using Git, run these:

```bash
# Set your name (shows up in commits)
git config --global user.name "Your Name"

# Set your email (use the same one as your GitHub account)
git config --global user.email "your.email@example.com"
```

**✅ Checkpoint:** You should now have a project folder on your computer!

---

## Step 2: Set Up Your Services

<!-- UNCOMMENT THE SERVICES YOU'RE USING THIS WEEK -->

<!--
### Resend (Email Sending)

**Why we need it:** To send emails from your app

1. Go to [resend.com](https://resend.com) and sign up
2. Click **API Keys** in the sidebar
3. Click **Create API Key**
4. Name it "AI Project"
5. Copy the key (starts with `re_`)

**Save it!** We'll use this in a minute.
-->

<!--
### Supabase (Database & Auth)

**Why we need it:** To store data and handle user authentication

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Name: "ai-project"
4. Database Password: Create a strong password (save it!)
5. Region: Choose one close to you
6. Click **Create new project** (takes ~2 minutes)

**While it's setting up, grab these values:**
- Go to **Project Settings** → **API**
- Copy the **Project URL** (looks like `https://xxx.supabase.co`)
- Copy the **anon/public** key
- Copy the **service_role** key (under "Project API keys")
-->

### Anthropic (Claude AI)

**Why we need it:** To use Claude AI in your app

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Click **API Keys**
4. Click **Create Key**
5. Name it "AI Project"
6. Copy the key (starts with `sk-ant-`)

### Save Your Keys Safely

**Create a `.env` file in your project:**

```bash
# Create the file
touch .env

# Open it in your default editor (Mac)
open .env

# Or on Windows
notepad .env

# Or on Linux
nano .env
```

**Paste this template and fill in your actual keys:**

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Uncomment and add other services as needed:
# RESEND_API_KEY=re_your-key-here
# PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# [FILL IN: Add any other environment variables you need]
```

### Secure Your Keys

**IMPORTANT:** Never commit your `.env` file to GitHub!

```bash
# Add .env to .gitignore
echo ".env" >> .gitignore

# Verify it worked
cat .gitignore
```

**✅ Checkpoint:** You should have a `.env` file with all your keys filled in!

---

## Step 3: Build with AI (Claude Code Prompts)

**[FILL IN: Which tool did you primarily use?]** (Claude Code, Cursor, Codex, etc.)

### Install Claude Code

```bash
# Option 1: Install globally
npm install -g @anthropic-ai/claude-code

# Option 2: Use npx (no install needed)
npx @anthropic-ai/claude-code
```

**Start Claude Code:**

```bash
# In your project folder
claude-code
```

---

### Prompt 1: Initialize the Project

**[FILL IN: What does this prompt set up?]**

Example: "This prompt creates a SvelteKit project with TypeScript and sets up the basic structure."

**📋 Copy and paste this into Claude Code:**

```
[FILL IN: Your actual first prompt]

Example:
I want to build an email automation system that runs on GitHub Actions.

Please help me:
1. Set up a SvelteKit project with TypeScript
2. Create a GitHub Actions workflow that runs on a schedule
3. Set up an API endpoint that can be triggered by the workflow
4. Configure environment variables for Resend API

I have these environment variables ready:
- ANTHROPIC_API_KEY
- RESEND_API_KEY

Ask me any questions about how this should work.
```

**What to expect:** [FILL IN: What did Claude actually do?]

**What I actually used:** [FILL IN: Paste your real prompt if it differs from the template above]

---

### Prompt 2: Build Core Functionality

**[FILL IN: What does this prompt build?]**

**📋 After the setup is complete, use this:**

```
[FILL IN: Your second prompt]

Example:
Now let's build the email sending functionality. I need:

1. A service that queries the database for users who need reminders
2. An email template using Resend
3. Logic to personalize each email based on user data
4. Error handling and logging

Please implement these one at a time and explain what each piece does.
```

**What to expect:** [FILL IN: What did Claude create?]

**Files created/modified:** [FILL IN: List the files Claude touched]

---

### Prompt 3: Add Intelligence

**[FILL IN: What AI features are you adding?]**

**📋 This is where it gets interesting:**

```
[FILL IN: Your third prompt]

Example:
Let's make the emails smarter using Claude AI. I want to:

1. Analyze each user's activity patterns
2. Generate personalized email content based on their progress
3. Suggest the best time to practice based on their history

Please:
- Create an API route that uses Claude AI to generate personalized content
- Show me how to craft effective prompts for consistent results
- Add proper error handling and retries
- Include rate limiting to stay within the free tier

Explain each part so I understand how it works.
```

**What to expect:** [FILL IN: What AI features did you end up with?]

---

### Prompt 4: Polish & Deploy Prep

**[FILL IN: What final touches are you adding?]**

**📋 Final touches:**

```
[FILL IN: Your final prompt]

Example:
Let's make this production-ready:

1. Add logging so I can monitor what emails are sent
2. Create a test mode that sends to my email only
3. Add unsubscribe handling
4. Show me how to test the GitHub Action locally
5. Help me set up the cron schedule in GitHub Actions

Guide me through testing everything works.
```

**What to expect:** [FILL IN: What polish did you add?]

---

### Running Your Project

**Start the development server:**

```bash
npm run dev
```

**Open your browser to:** `http://localhost:5173`

**Test the feature:**

[FILL IN: How do you test this locally?]

Example:
```bash
# Trigger the cron endpoint manually
curl -X POST http://localhost:5173/api/cron/send-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

**[ADD: Screenshot of it working]**

---

## Challenges & Solutions

### Challenge 1: [FILL IN: What went wrong?]

**What happened:** [FILL IN: Describe the problem]

Example: "GitHub Actions kept failing because the environment variables weren't available in the workflow."

**How I solved it:** [FILL IN: Your solution]

Example: "I had to add the secrets in the GitHub repo settings under Settings → Secrets and variables → Actions."

**The prompt I used:**

```
[FILL IN: The Claude Code prompt that helped you debug]

Example:
I'm getting an error in my GitHub Action: "RESEND_API_KEY is not defined"

The environment variable is in my .env file, but the workflow can't access it. How do I pass environment variables to GitHub Actions?
```

**Lesson learned:** [FILL IN: What would you do differently?]

---

### Challenge 2: [FILL IN: Another challenge]

**What happened:** [FILL IN: The problem]

**How I solved it:** [FILL IN: Your solution]

**The prompt I used:**

```
[FILL IN: Your debugging prompt]
```

**Lesson learned:** [FILL IN: Key takeaway]

---

**[ADD: More challenges as needed]**

---

## The Results

**[FILL IN: Show the impact or results]**

Example metrics:
- ✅ Emails sent automatically every Sunday
- ✅ 45% open rate (up from 20% with manual emails)
- ✅ Zero manual work required
- ✅ Cost: $0 (within free tiers)

**[ADD: Screenshot of the finished feature in action]**

---

## Try It Yourself

**Now it's your turn!**

Fork this project and try these variations:

1. **Easy:** [FILL IN: Simple modification]
2. **Medium:** [FILL IN: Moderate challenge]
3. **Hard:** [FILL IN: Advanced challenge]

Example:
1. **Easy:** Change the email template design
2. **Medium:** Add SMS notifications using Twilio
3. **Hard:** Make the send time personalized per user

**Share what you built!**
- Post on Twitter/X with #AIForDummies
- Tag me: [Your Twitter handle]
- Open a PR if you add something cool!

---

## What's Next?

**[FILL IN: Tease next week's project]**

Example: "Next week, we'll add AI-powered conversation analysis that gives users personalized feedback on their language practice."

Next week, we'll build:
- [FILL IN: Feature 1]
- [FILL IN: Feature 2]
- [FILL IN: Feature 3]

**Want to go deeper?**

Resources I found helpful:
- [FILL IN: Relevant docs or tutorials you used]
- [FILL IN: Another helpful resource]
- [FILL IN: Community or forum]

---

## Questions?

Drop a comment below or reach out:
- Twitter/X: [Your handle]
- GitHub: [Your profile]
- Email: [Your email]

Happy building! 🚀

---

## Behind the Scenes

**Time spent:** [FILL IN: How long did this actually take?]

**Tools used:**
- [FILL IN: Claude Code / Cursor / etc.]
- [FILL IN: Other tools]

**Files changed:** [FILL IN: Number of files / lines of code]

**Most helpful Claude prompt:** [FILL IN: Which prompt saved you the most time?]

---

*This post documents my real development process using AI tools. All prompts and code examples are tested and working as of [DATE].*

<!--
WEEKLY CHECKLIST (Delete before publishing):
- [ ] Filled in all [FILL IN] sections
- [ ] Added actual prompts you used
- [ ] Included screenshots/GIFs
- [ ] Listed key files with links
- [ ] Described challenges and solutions
- [ ] Added results/metrics
- [ ] Teased next week
- [ ] Proofread for typos
- [ ] Tested all copy-paste commands
- [ ] Removed this checklist
-->