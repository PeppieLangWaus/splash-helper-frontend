export type ChatColorTag = 'HIGHLIGHT' | 'NORMAL';

export interface ChatTextRun {
  text: string;
  tag?: ChatColorTag;
}

const COLOR_TAG_RE = /<col(HIGHLIGHT|NORMAL)>/g;

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
