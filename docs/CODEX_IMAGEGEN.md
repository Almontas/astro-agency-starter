# Codex `image_gen` — free image generation via ChatGPT subscription

A portable recipe for generating images by shelling out to the Codex CLI's built-in `image_gen` tool. Codex routes through your authenticated ChatGPT subscription, so each image is sunk cost up to your plan limits — versus per-call billing on OpenAI, MidJourney, Flux, or Google Nano Banana.

> **This file is a recipe, not a library.** No code is shipped here. When you need to call Codex from this project, read this doc and write a small wrapper that fits the moment (e.g. `scripts/codex-image.mjs` that shells out via `child_process.spawn`). The proven invocation below is the durable part — the wrapper around it is disposable.

## When to use this vs. the paid scripts

This project already has paid image-gen scripts in `scripts/`:

- `gen-newsletter-header.mjs`
- `gen-blog-image-gpt-vs-mj-vs-flux.mjs`

Use **Codex** for:
- Ad-hoc / one-off images: hero placeholders, blog illustrations, concept art, internal mockups.
- Anything where ~100s of latency per image is fine.
- Exploration where you'd otherwise burn API budget.

Keep the **paid scripts** for:
- Multi-pass automated review pipelines (brand-color QA, glyph rendering checks).
- Production batches where per-image latency matters.
- Anything benchmarking models against each other.

## Prerequisites

```bash
codex --version                        # Codex CLI must be installed
test -f ~/.codex/auth.json && echo OK  # Codex must be authenticated
```

If `auth.json` is missing, run `codex login` and sign in with your ChatGPT account.

## The proven invocation

```bash
codex exec \
  --skip-git-repo-check \
  --sandbox workspace-write \
  --cd /path/to/your-site \
  -c model_reasoning_effort=low \
  --json \
  "Use the image_gen tool to generate one 1024x1024 PNG image: [DESCRIPTION HERE].

   After the tool returns the image, save it to ./public/images/[NAME].png at exactly 1024x1024 (resize with sips if the tool returns a different size). This is a hard requirement: you MUST call image_gen and you MUST write the file before ending the turn."
```

Replace `[DESCRIPTION HERE]`, `[NAME]`, the size, and the output path. Everything else stays the same.

### Why each flag matters

| Flag | Why |
|---|---|
| `--skip-git-repo-check` | Lets Codex run inside any directory, even one that isn't a git repo. |
| `--sandbox workspace-write` | Required so Codex can `cp` the generated PNG out of `~/.codex/generated_images/` into your workspace. With `read-only`, the wrapper would have to do the copy itself. |
| `--cd <project>` | Anchors all relative paths in the prompt to the project root. |
| `-c model_reasoning_effort=low` | The API rejects `none`/`minimal` for `image_gen`. `low` is the floor and the fastest working level. |
| `--json` | Streams structured events; useful if a wrapper wants to detect tool calls or errors programmatically. Drop for plain text output. |

## Non-obvious facts (these all cost real time to learn)

1. **Tool name is `image_gen`**, not `image_gen.imagegen`. Codex's own self-description sometimes says the latter; the API expects the former.
2. **Reasoning floor is `low`.** `none` and `minimal` return: *"cannot be used with reasoning.effort minimal: image_gen, web_search"*. `low`/`medium`/`high`/`xhigh` all work.
3. **Imperative prompt language is the actual reliability lever — not reasoning effort.** Without `you MUST call image_gen and you MUST write the file`, the model frequently hallucinates completion ("Generated the image") without ever firing the tool. With the imperative phrasing, even `low` reasoning fires the tool reliably. Passive prompts ("do not save files yourself", "final response should mention completion only") nudge the model to skip the tool.
4. **Native output is ~1254×1254**, regardless of the size you ask for. Codex itself usually runs `sips -z W H file` after the tool returns. Include `save to ./path at exactly WIDTHxHEIGHT` in the prompt to make this explicit.
5. **Generated PNGs land at `~/.codex/generated_images/<thread-id>/ig_<hash>.png`** before being copied into the workspace. With `--sandbox workspace-write`, Codex itself does the copy. With `read-only`, your wrapper would need to find and copy the file out, which is fiddly — don't bother.
6. **Speed by reasoning level (same prompt):**
   - `low` ≈ 1:40 (~100 reasoning tokens) — default
   - `medium` ≈ 2:10 (~670 tokens)
   - `high` ≈ 3:00+ (~1000–1300 tokens)
7. **9:16 portrait works** — pass `1080x1920` (or any aspect ratio) in the prompt; the model understands and the tool resizes after.

**Default to `low`** unless the composition is complex (multi-section layouts, dense typography, brand-color precision). Bump to `medium` only if the first attempt looks off.

## Failure modes & fixes

| Symptom | Cause | Fix |
|---|---|---|
| `agent_message` empty, no `tool_call` event in `--json` output | Prompt was too passive | Rewrite with `you MUST call image_gen and you MUST write the file` |
| Hallucinated completion text without any image written | Same root cause | Same fix |
| API error: `cannot be used with reasoning.effort minimal` | `model_reasoning_effort=none` or `minimal` | Use `low` or higher |
| Output PNG is the wrong size | Codex skipped the resize step | Add `at exactly WIDTHxHEIGHT (resize with sips if needed)` to the prompt |
| Generated file not in workspace | Sandbox is `read-only` | Use `--sandbox workspace-write` |

## When NOT to use Codex

- **Multi-pass review pipelines.** If your workflow generates → reviews with another model → regenerates with fix instructions, that needs deterministic API access. Stick with the paid models.
- **Latency-sensitive production runs.** Codex at `low` is ~100s/image. A batch of 20 images is over half an hour. The paid OpenAI/Flux APIs return in 5–20s.

## For the next Claude session reading this

If you need to call Codex `image_gen` from this Astro/Node project more than once or twice, drop a tiny wrapper at `scripts/codex-image.mjs` next to the existing `gen-*.mjs` scripts. One function is enough — accept `{ name, size, prompt, outputDir }`, build the prompt from the template above, and `child_process.spawn('codex', [...args])`. Stream stdout so the user sees progress. Don't add retries, don't add a queue, don't generalize across providers — when you need that, the paid scripts already exist.

The recipe in this doc is the durable part. The wrapper is throwaway.
