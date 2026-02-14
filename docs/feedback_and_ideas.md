# Feedback & Idea Tracker

This document tracks emergent ideas for the "Engagement" workflow and monitors their **Frequency of Need**. This serves as a "scratchpad" for user feedback and roadmap discovery.

## Goal
To evolve a system that facilitates deep engagement, active reading, and memorization of web-sourced content by observing recurring friction and needs.

## Idea Log

### 1. LLM-Injected Structure (Header Injection)
- **Concept:** Use an LLM to analyze a "flat" Markdown article (no headers) and inject appropriate `#` and `##` headers based on content boundaries.
- **Why:** Enables the "Header Tree" UI for unstructured clippers; provides logical "checkpoints" for reading.
- **Request Count:** 1
- **Status:** Exploration

### 2. Header Tree-UI for Articles
- **Concept:** Replicate the "Book Chapter Tree" UI for standard Markdown notes.
- **Why:** Better navigation for long-form web content; visualizes "Coverage" by chapter.
- **Request Count:** 1
- **Status:** Scoped in ADR-020

### 3. Abbreviated Paragraph Selection Menu
- **Concept:** Show only the first 40-60 characters of a paragraph in the mobile selection menu.
- **Why:** Increases information density on small screens; makes scrolling through 50+ paragraphs manageable.
- **Request Count:** 1
- **Status:** Scoped in STORY-010

### 4. Direct Engagement Counters (Coverage)
- **Concept:** A HUD or indicator showing `[Processed Pgs] / [Total Pgs]`.
- **Why:** Gamification of the reading process; ensures "100% Coverage" of a web article.
- **Request Count:** 1
- **Status:** Scoped in STORY-010

### 5. Frequency Tracking Workflow
- **Concept:** Using a "Frequency of Need" metric to prioritize the roadmap.
- **Why:** Ensures implementation follows actual user friction.
- **Request Count:** 1
- **Status:** ACTIVE (This document)

## Roadmap Evolution (History)
- **2026-02-13:** Scoped "Direct In-Situ Engagement" for Markdown notes (ADR-020).
