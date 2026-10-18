// All user-facing text lives here.
// To add Thai: create strings/th.ts with the same keys.

export const strings = {
  app: {
    name: "Jinx",
    tagline: "Sleep better with Jinx.",
  },
  disclaimer: {
    title: "A note before we start",
    body: "This is a prototype for testing purposes. It is not medical advice and does not replace a doctor or mental health professional.",
    cta: "I understand, continue",
  },
  consent: {
    checkboxLabel:
      "I understand this is a prototype for sleep habit support, not a medical service. I consent to my anonymised sleep data being used to improve this programme.",
    required: "Please tick the box to continue.",
  },
  auth: {
    signupTitle: "Create your account",
    loginTitle: "Welcome back",
    emailLabel: "Email address",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "What should Jinx call you?",
    passwordLabel: "Password",
    signupCta: "Create account",
    loginCta: "Sign in",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    signInLink: "Sign in",
    signUpLink: "Sign up",
  },
  nav: {
    home: "Home",
    progress: "Progress",
    feedback: "Send feedback",
  },
  feedback: {
    title: "Send feedback",
    placeholder: "What's on your mind?",
    cta: "Send",
    successMessage: "Thanks — your feedback has been sent.",
    errorMessage: "Something went wrong. Please try again.",
  },
  crisis: {
    title: "You're not alone.",
    body: "Thank you for telling us. What you're feeling matters, and we want to make sure you get the right support.",
    subBody:
      "Right now, talking to a real person is the best next step. This app isn't the right support for this moment.",
    hotline1323Label: "Department of Mental Health Hotline",
    hotline1323Hours: "Available 24 hours a day",
    hotline1669Label: "Emergency Services",
    callButton: "Call {number}",
    backToHome: "Back to home",
    homeNotice:
      "Need to talk? Call 1323 (mental health) or 1669 (emergency) anytime.",
  },
  assessment: {
    progressLabel: "Question {current} of {total}",
    nextCta: "Next",
    backCta: "Back",
    isi: {
      title: "About your sleep",
      intro:
        "The following questions are about your sleep over the last two weeks. There are no right or wrong answers.",
    },
    type: {
      title: "What does your sleep look like?",
    },
    duration: {
      title: "How long has this been going on?",
    },
    selfharm: {
      questionText:
        "Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself in some way?",
      options: {
        not_at_all: "Not at all",
        several_days: "Several days",
        more_than_half: "More than half the days",
        nearly_every_day: "Nearly every day",
      },
    },
    redflags: {
      stopbang: {
        title: "A few more questions about your health",
      },
      mood: {
        softFlagMessage:
          "It looks like you may be going through a difficult time. We recommend talking to a mental health professional alongside using Jinx. You can still continue.",
      },
    },
    contraindications: {
      title: "Before we continue",
      intro:
        "Please answer these questions so we can make sure the programme is right for you.",
    },
    routing: {
      tipsOnly: {
        title: "Your sleep looks okay",
        body: "Your score suggests your sleep is mostly fine. Here are some habits that can help keep it that way.",
      },
      circadianNotSupported: {
        title: "Jinx isn't quite the right fit for you yet.",
        body: "Your sleep pattern suggests a circadian rhythm issue, which responds best to a different kind of support than what Jinx offers right now.",
        tip: "Here's one thing that helps most people in your situation: try to keep the same wake time every day, even on weekends, for the next two weeks.",
        waitlistLabel: "Leave your email for updates (optional)",
        waitlistCta: "Notify me",
      },
      doctorFirst: {
        title: "We recommend speaking to a doctor first.",
        body: "Based on your answers, it's worth checking in with a doctor before starting a sleep programme. You can come back here afterwards.",
        reminderCta: "Set a reminder to come back",
        alreadySawDoctorCta: "I've already spoken to a doctor",
        attestationLabel:
          "I have seen a doctor and they said it is okay for me to start a sleep programme.",
        attestationRequired: "Please tick the box to continue.",
        weekTwoReminder:
          "Just a reminder: we recommended checking in with a doctor before starting. If you haven't yet, it's not too late.",
      },
      complete: {
        title: "Here's what we found",
        isiBandLabels: {
          none: "No clinical insomnia",
          subthreshold: "Subthreshold insomnia",
          moderate: "Moderate insomnia",
          severe: "Severe insomnia",
        },
        continueCtaLight: "Meet Jinx",
        continueCtaFull: "Let's get started",
      },
    },
  },
  jinx: {
    lightTrackIntro: {
      title: "Hi, I'm Jinx.",
      body: "Your sleep has been off for a while, but the good news is that short-term sleep problems respond really well to a few habit changes. We're going to do a lighter 4-week programme together — no complicated rules, just the stuff that actually works.",
      cta: "Let's go",
    },
    fullTrackIntro: {
      title: "Hi, I'm Jinx.",
      body: "Before we build your personal sleep programme, I need to understand what's actually happening with your sleep. For the next 7–14 days, I'll ask you a few questions each morning. There's no rush — take your time.",
      baselineNote:
        "The diary period is free and there's no time limit. I'll also share one sleep tip every day while we're collecting data.",
      cta: "Start the diary",
    },
  },
  diary: {
    morningCheckin: {
      title: "Morning check-in",
      bedTimeLabel: "What time did you get into bed?",
      riseTimeLabel: "What time did you get out of bed?",
      solLabel: "How long did it take you to fall asleep? (minutes)",
      wasoLabel:
        "How many minutes were you awake during the night (after first falling asleep)?",
      qualityLabel: "How would you rate your sleep quality?",
      qualityOptions: ["Very poor", "Poor", "Fair", "Good", "Very good"],
      submitCta: "Save",
    },
    validationErrors: {
      timesOutOfOrder: "Wake time must be after bed time.",
      tibTooShort: "Time in bed must be at least 2 hours.",
      tibTooLong: "Time in bed cannot be more than 16 hours.",
      entryTooLate: "This entry is too late to count for last night.",
      tstNegative:
        "Your sleep time doesn't add up — please check your SOL and WASO values.",
      required: "Please fill in all fields.",
    },
    baselineRestartMessage:
      "It looks like we don't quite have enough nights to build your programme yet. No worries — let's keep going for a bit longer. Your previous entries are saved.",
    hygieneTipTitle: "Today's sleep tip",
  },
  progress: {
    title: "Your progress",
    seLabel: "Sleep efficiency",
    tstLabel: "Time asleep",
    isiLabel: "Insomnia score (ISI)",
    streakLabel: "Consistent wake time",
    noDataYet: "Complete a few more check-ins to see your progress here.",
  },
  dormant: {
    reengagementTitle: "Welcome back.",
    reengagementBody:
      "We paused your programme while you were away — everything is still here. Ready to pick up where you left off?",
    reengagementCta: "Resume",
  },
  admin: {
    title: "Admin",
    signupsTab: "Signups",
    routingTab: "Routing outcomes",
    feedbackTab: "Feedback",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    notFound: "Page not found.",
    unauthorized: "You don't have permission to view this page.",
  },
} as const;

export type StringKey = keyof typeof strings;
