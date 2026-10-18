// Cognitive therapy content for light track and full track.

export interface ThoughtCard {
  id: number;
  belief: string;
  counterQ1: string;
  counterQ2: string;
}

export interface WorryExercisePrompt {
  id: number;
  instruction: string;
}

export type CognitiveItem =
  | { type: "thought_card"; content: ThoughtCard }
  | { type: "worry_exercise"; content: WorryExercisePrompt };

export const THOUGHT_CARDS: ThoughtCard[] = [
  {
    id: 1,
    belief: "If I don't get 8 hours of sleep I won't be able to function tomorrow.",
    counterQ1: "Think of a time you managed fine on less sleep. What happened?",
    counterQ2: "How many hours of sleep do you actually need to function — not ideally, but minimally?",
  },
  {
    id: 2,
    belief: "I've lost control of my sleep and will never get it back.",
    counterQ1: "Has your sleep ever been better than it is now? What changed?",
    counterQ2: "What does 'control' over sleep actually mean — and is it realistic?",
  },
  {
    id: 3,
    belief: "Lying in bed resting is almost as good as sleeping.",
    counterQ1: "What does your body actually need during rest vs. sleep?",
    counterQ2: "Has spending more time in bed actually helped your sleep?",
  },
  {
    id: 4,
    belief: "I must not have any mental activity before bed or I won't sleep.",
    counterQ1: "What activities that involve thinking do you do every day?",
    counterQ2: "Is it the thinking that keeps you awake, or your reaction to the thinking?",
  },
  {
    id: 5,
    belief: "A bad night's sleep will ruin the next day.",
    counterQ1: "Describe the worst thing that actually happened after your worst recent night of sleep.",
    counterQ2: "How do other people around you cope after poor nights?",
  },
];

export const WORRY_PROMPTS: WorryExercisePrompt[] = [
  {
    id: 1,
    instruction:
      "Take 15 minutes now to write down every worry on your mind. For each worry, write one small action you could take — or a reason why it's outside your control.",
  },
  {
    id: 2,
    instruction:
      "List three things that are making you anxious tonight. For each, ask: 'Can I do anything about this tonight?' If no, write 'I'll think about this tomorrow.'",
  },
];

export function getCognitiveItemForDay(dayIndex: number): CognitiveItem {
  if (dayIndex % 2 === 0) {
    return {
      type: "thought_card",
      content: THOUGHT_CARDS[Math.floor(dayIndex / 2) % THOUGHT_CARDS.length],
    };
  }
  return {
    type: "worry_exercise",
    content: WORRY_PROMPTS[Math.floor(dayIndex / 2) % WORRY_PROMPTS.length],
  };
}
