/** RuneLite's built-in chat commands (`!pb`, `!log`, `!pets`, etc. — the "Chat Commands" plugin,
 *  distinct from splash-helper's own resolved `!log`/`!pets` items) build their reply text with
 *  `ChatMessageBuilder`, switching color via `ChatColorType.NORMAL`/`HIGHLIGHT` rather than a
 *  literal hex value. The client normally substitutes those for real colors (per the viewer's own
 *  RuneLite chat-color config) before render, but we read the raw fc/cc line straight off the
 *  relay, before any client ever gets to do that substitution — so the tags show up literally in
 *  the text, e.g. `<colHIGHLIGHT>Zulrah kill count: <colNORMAL>1,234`.
 *
 *  Unlike a real `<col=RRGGBB>` tag (which these get rewritten to client-side), there's no closing
 *  tag: each one switches the color for every run of text after it, until the next tag or the end
 *  of the line. */
export type ChatColorTag = 'HIGHLIGHT' | 'NORMAL';

/** One run of text and the color tag (if any) it was preceded by — `tag` is unset for the leading
 *  run before the first tag, which just inherits whatever color the line already renders in. */
export interface ChatTextRun {
  text: string;
  tag?: ChatColorTag;
}

const COLOR_TAG_RE = /<col(HIGHLIGHT|NORMAL)>/g;

/** Splits a chat line's text on `<colHIGHLIGHT>`/`<colNORMAL>` tags into the runs of text each one
 *  applies to, stripping the tags themselves out. Returns a single untagged run unchanged when the
 *  text has none, so callers can run this unconditionally on any fc/cc line. */
export function splitColorTagRuns(text: string): ChatTextRun[] {
  if (!text.includes('<col')) return [{ text }];

  const parts = text.split(COLOR_TAG_RE);
  const runs: ChatTextRun[] = [];
  if (parts[0]) runs.push({ text: parts[0] });
  for (let i = 1; i < parts.length; i += 2) {
    const runText = parts[i + 1];
    if (runText) runs.push({ text: runText, tag: parts[i] as ChatColorTag });
  }
  return runs;
}
