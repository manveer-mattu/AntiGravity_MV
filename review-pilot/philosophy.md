# ReviewPilot.ai - Platform Philosophy

> **Mission:** Transform generic review responses into reputation assets that optimize for AI discoverability.

---

## 1. Core Mission

We are building a **Generative Engine Optimization (GEO)** platform. Every feature must prioritize making a business "discoverable" by AI Overviews and LLMs. We are moving from "Generic Replies" to "Reputation Assets."

---

## 2. The "Brand DNA" Data Contract

### Never Guess
If a brand fact (staff name, product, price) is missing, the AI must not hallucinate. It should fallback to a warm, brand-aligned general greeting.

### Knowledge over Slop
Prioritize specific data from the `KnowledgeBase` in every AI response.

### Tone Mapping
The `brand_voice.tone_score` (1-10) is the master variable:
- **1-3:** Formal, professional, minimal emojis
- **4-7:** Warm, helpful, community-focused
- **8-10:** Witty, bold, casual, expressive

---

## 3. GEO Injection Logic

- Every **5-star review reply** MUST attempt to naturally weave in one `geo_target` keyword
- **Constraint:** The keyword must fit the sentence flow. If it sounds like "keyword stuffing," the agent has failed

---

## 4. UI/UX Principles (2026 "Quiet UI")

### High Information Density, Low Visual Noise
Use whitespace and typography over borders and colors.

### Verification First
Users must always see a "Live Preview" of how their Knowledge Base changes affect AI drafts.

### Triage Clarity
Use high-contrast status badges: `[SAFE]`, `[GEO-OPTIMIZED]`, `[CRITICAL-HUMAN-ONLY]`.

---

## 5. Security & Safety

### The Crisis Gate
Any review containing `safety_settings.crisis_keywords` must be locked. No API call to the LLM should be made for these reviews until a human unlocks them.

### Sanitization
All scraped URL data must be distilled into plain text Markdown before being stored or sent to the LLM.

---

## Implementation Checklist

- [ ] Knowledge Base supports Brand DNA (tone_score, geo_targets)
- [ ] AI client implements GEO injection for 5-star reviews
- [ ] Crisis keyword detection blocks automated replies
- [ ] UI provides live preview of AI drafts
- [ ] Status badges: SAFE, GEO-OPTIMIZED, CRITICAL-HUMAN-ONLY
- [ ] All external data is sanitized to plain text before storage
