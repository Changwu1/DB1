// Rotating daily sleep hygiene tips — same library used in light track and full track baseline.

export interface SleepTip {
  id: number;
  category: "caffeine" | "alcohol" | "environment" | "nap" | "general";
  title: string;
  body: string;
}

export const SLEEP_TIPS: SleepTip[] = [
  {
    id: 1,
    category: "caffeine",
    title: "Cut caffeine after 2 pm",
    body: "Caffeine has a half-life of about 5–7 hours. A 3 pm coffee can still be half-strength in your system at 9 pm. Tea, cola, and some painkillers count too.",
  },
  {
    id: 2,
    category: "environment",
    title: "Keep your bedroom cool",
    body: "Your body needs to drop its core temperature to fall asleep. A cool room (around 18°C / 65°F) helps that happen faster.",
  },
  {
    id: 3,
    category: "nap",
    title: "Nap before 3 pm if you must",
    body: "Short naps (20 min) can reduce sleepiness without hurting night sleep — but only if taken before mid-afternoon. Later naps steal sleep pressure.",
  },
  {
    id: 4,
    category: "general",
    title: "Use natural light in the morning",
    body: "Bright morning light is the strongest signal your body clock has. Even 10–15 minutes outside (or by a window) sets your rhythm for the day.",
  },
  {
    id: 5,
    category: "environment",
    title: "Dim the lights an hour before bed",
    body: "Bright light — especially from screens — suppresses melatonin. Dimming your environment an hour before bed is a simple, effective nudge toward sleep.",
  },
  {
    id: 6,
    category: "alcohol",
    title: "Alcohol disrupts sleep quality",
    body: "Alcohol helps you fall asleep faster but fragments the second half of your night. It cuts REM sleep, which is the most restorative stage.",
  },
  {
    id: 7,
    category: "general",
    title: "Regular wake time is the anchor",
    body: "The most powerful thing you can do for your sleep clock is to wake up at the same time every day — even weekends. Bedtime can vary; wake time should not.",
  },
  {
    id: 8,
    category: "environment",
    title: "Your bed is for sleeping",
    body: "Working, scrolling, or watching TV in bed trains your brain to associate the bed with wakefulness. Keep it for sleep only.",
  },
  {
    id: 9,
    category: "nap",
    title: "Avoid long naps",
    body: "Naps longer than 30 minutes can cause sleep inertia (grogginess) and reduce your sleep drive at night. Set an alarm.",
  },
  {
    id: 10,
    category: "general",
    title: "Wind-down routine matters",
    body: "A consistent 20–30 minute wind-down routine signals your nervous system that sleep is coming. It doesn't have to be elaborate — reading, light stretching, or a warm shower all work.",
  },
  {
    id: 11,
    category: "caffeine",
    title: "Caffeine is in more places than you think",
    body: "Dark chocolate, green tea, some headache tablets, and energy drinks all contain caffeine. Check labels if you're struggling to fall asleep.",
  },
  {
    id: 12,
    category: "environment",
    title: "Silence or white noise — pick one",
    body: "Complete silence works for some people; constant low noise (a fan, white noise) works better for others. Inconsistent noise — like a snoring partner — is the worst.",
  },
  {
    id: 13,
    category: "general",
    title: "Exercise helps — timing matters less than you think",
    body: "Regular exercise significantly improves sleep quality. Research suggests even evening exercise is fine for most people, despite the old advice to avoid it.",
  },
  {
    id: 14,
    category: "general",
    title: "Don't watch the clock",
    body: "Checking the time during the night increases anxiety and makes it harder to fall back asleep. Turn clocks away from your bed.",
  },
];

export function getTipForDay(startDate: Date, today: Date): SleepTip {
  const diffMs = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return SLEEP_TIPS[diffDays % SLEEP_TIPS.length];
}
