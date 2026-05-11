import { GameState, GameEvent } from '../../shared/src/types';

let Anthropic: any = null;
let client: any = null;

async function getClient() {
  if (!process.env.USE_LLM_NARRATION || process.env.USE_LLM_NARRATION !== 'true') return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (client) return client;

  try {
    const mod = await import('@anthropic-ai/sdk');
    Anthropic = mod.default;
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return client;
  } catch {
    return null;
  }
}

export async function generateNarration(state: GameState, recentEvents: GameEvent[]): Promise<string | null> {
  const c = await getClient();
  if (!c) return null;

  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][state.month];
  const eventLines = recentEvents.slice(0, 8).map(e => `- ${e.message}`).join('\n');

  const territoryCount = (faction: string) =>
    Object.values(state.countries).filter(c => c.faction === faction)
      .reduce((s, c) => s + c.territories.length, 0);

  const prompt = `You are a WW2 newsreel narrator. Write a 2-3 sentence dramatic news bulletin for ${month} ${state.year}, Turn ${state.turn + 1}.

Recent battlefield events:
${eventLines || 'No major engagements this month.'}

Axis controls ${territoryCount('axis')} territories. Allies control ${territoryCount('allies')}. Neutral ${territoryCount('neutral')}.

Write in the style of a 1940s radio broadcast. Be specific about battles if mentioned. Keep it under 60 words. No hashtags or modern language.`;

  try {
    const message = await c.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });
    return (message.content[0] as any)?.text ?? null;
  } catch (err) {
    console.error('Narration error:', err);
    return null;
  }
}
