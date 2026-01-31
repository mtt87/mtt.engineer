---
name: review-blog-post
description: Review a blog post for typos, grammar, clarity, and style. Use when the user wants feedback on their writing or asks to review/proofread a blog post.
allowed-tools: Read, Glob
argument-hint: [file-path]
---

# Blog Post Review

Review a blog post and provide feedback on errors, clarity, and style.

## Goals

- Keep writing **personal** and conversational
- Use **simple words** - avoid jargon and overly formal language
- Make sentences **clear and concise**

## What to Check

### 1. Frontmatter

- Dates are valid (YYYY-MM-DD format, real dates)
- `updatedAt` is not before `createdAt`
- Title and description are clear

### 2. Spelling and Grammar

- Typos (e.g., "rememberd" → "remembered")
- Subject-verb agreement
- Missing words (e.g., "corrected only future" → "corrected only in future")
- Verb forms (e.g., "try" vs "trying" in context)

### 3. Clarity and Flow

- Split long sentences that try to say too many things
- Remove filler words and redundant phrases
- Fix run-on sentences (comma splices)
- Ensure each paragraph has one main idea

### 4. Style

- Avoid formal/academic tone (e.g., "NB:" → just say it naturally)
- Use active voice when possible
- Keep technical explanations simple
- Don't over-explain obvious things

### 5. Structure

- Does the post have a clear beginning, middle, and end?
- Is the ending abrupt? Suggest a brief conclusion if needed
- Are code blocks and images properly placed?

## Output Format

1. **List all errors** with line numbers and suggested fixes
2. **Group by category** (dates, typos, clarity, style)
3. **Show before/after** for each fix
4. At the end, **ask if the user wants to apply the fixes**

## Process

1. Read the file provided (or ask which file to review)
2. Analyze for all the issues above
3. Present findings in a clear table or list
4. Wait for user approval before making changes

If no file is provided, check `$ARGUMENTS` or look for recently modified `.md` or `.mdx` files in `website/src/content/posts/`.
