export interface BlogArticle {
  slug: string;
  tag: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  title: string;
  excerpt: string;
  content: {
    intro: string;
    sections: {
      heading: string;
      paragraphs: string[];
      highlight?: string;
    }[];
    takeaways: string[];
  };
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "open-centres-not-weaknesses",
    tag: "Centres · 6 min",
    category: "Centres",
    readTime: "6 min",
    date: "Aug 12, 2026",
    author: "Nine Centres Editorial",
    title: "Open centres are not weaknesses",
    excerpt: "Open centres are not broken mechanics or missing traits. They are your primary receptive antennas where you develop true wisdom.",
    content: {
      intro: "When people first see their Human Design chart and notice five or six white, undefined centres, the instinctive reaction is often disappointment: 'Am I missing half of myself?' In reality, undefined centres are not deficiencies — they are your receptive sensing organs.",
      sections: [
        {
          heading: "Defined vs Open: The Fundamental Difference",
          paragraphs: [
            "A defined (coloured) centre operates consistently within you. It broadcasts energy outwards into the room in a fixed, reliable frequency that you can access at any time.",
            "An open (white) centre has no fixed way of processing that specific energy. Instead, it takes in the frequency of everyone in your immediate auric field, amplifies it by a factor of three, and reflects it back."
          ],
          highlight: "Where you are defined, you are here to transmit. Where you are open, you are here to become wise."
        },
        {
          heading: "The Wisdom of the Open Center",
          paragraphs: [
            "Because an open centre experiences thousands of different variations of energy throughout your life, it becomes an expert discriminator. An open Solar Plexus knows who in the room is carrying authentic emotional grief versus manufactured drama.",
            "An open Ego centre understands true value without needing to enter the rat race of proving self-worth. The conditioning only occurs when your mind identifies with what you are feeling and mistakenly claims: 'This is who I am.'"
          ]
        },
        {
          heading: "Practical Deconditioning Strategy",
          paragraphs: [
            "1. Notice physical sensations in open centres without creating an urgent story around them.",
            "2. When feeling intense pressure or emotional waves, ask: 'Is this mine, or is this the room?'",
            "3. Step out of other people's auras when you need to return to your baseline energetic state."
          ]
        }
      ],
      takeaways: [
        "Open centres amplify whatever energy surrounds them.",
        "You do not need to fix, fill, or define your open centres.",
        "Wisdom comes from observing the amplified energy without identifying with it."
      ]
    }
  },
  {
    slug: "how-to-test-your-gut-yes",
    tag: "Authority · 8 min",
    category: "Authority",
    readTime: "8 min",
    date: "Aug 08, 2026",
    author: "Nine Centres Editorial",
    title: "How to test your gut yes for a week",
    excerpt: "For Generators and Manifesting Generators, the sacral response is binary, physical, and instantaneous. Here is a 7-day protocol to recalibrate your gut truth.",
    content: {
      intro: "Approximately 70% of humanity are Sacral beings (Generators and Manifesting Generators). Yet modern society trains us to make decisions entirely from mental pros-and-cons lists, effectively muting the most powerful navigational motor in our biology.",
      sections: [
        {
          heading: "What a Sacral Response Actually Feels Like",
          paragraphs: [
            "The Sacral Centre is not a verbal, reasoning intellect. It is a primal, acoustic, and somatic motor. It responds to external stimuli in real time with binary sounds: 'uh-huh' (expansive yes), 'un-un' (contractive no), or silence/shrug (not now).",
            "A genuine response originates from the lower abdomen, below the navel, and creates an immediate physical pull toward the activity, or a feeling of constriction and heaviness."
          ],
          highlight: "The mind can rationalize fifty reasons to take a job; the Sacral knows within 2 seconds whether your motor has the fuel to complete it."
        },
        {
          heading: "The 7-Day Binary Questioning Experiment",
          paragraphs: [
            "To reactivate your sacral connection, recruit a friend or partner to ask you closed, binary questions (never open-ended ones like 'What do you want for dinner?').",
            "Examples of proper sacral prompts: 'Do you want Italian food tonight?' 'Do you have the energy to respond to that email right now?' 'Do you want to go for a walk?'",
            "Answer immediately with sounds rather than conceptual sentences. Notice how quickly your body knows the truth before your intellect intervenes."
          ]
        }
      ],
      takeaways: [
        "The Sacral responds to stimuli — it does not initiate from the mind.",
        "Binary questions ('yes/no') trigger immediate physical responses.",
        "Energy is renewable only when spent on what you genuinely respond to."
      ]
    }
  },
  {
    slug: "why-birth-time-changes-your-chart",
    tag: "Basics · 5 min",
    category: "Basics",
    readTime: "5 min",
    date: "Jul 29, 2026",
    author: "Nine Centres Editorial",
    title: "Why birth time changes your chart",
    excerpt: "The Moon and Ascendant shift rapidly throughout a single 24-hour cycle. Understanding exact birth data precision is essential for gate accuracy.",
    content: {
      intro: "A common question in Human Design is: 'Does it really matter if I was born at 06:15 instead of 06:45?' The short answer is yes. In Human Design, a shift of just 15 to 30 minutes can alter a profile line, activate a completely different gate, or even change your defined centres.",
      sections: [
        {
          heading: "The Speed of Planetary Transits",
          paragraphs: [
            "The 64 gates of the mandala correspond to 64 hexagrams, each divided into 6 lines, 6 colors, 6 tones, and 5 bases. The Moon traverses roughly 13 degrees per day, moving through a new line every 1.8 hours.",
            "If your birth occurs right at a gate boundary (the cusp between two hexagrams), an inaccuracy of a few minutes can flip an entire channel from open to defined."
          ],
          highlight: "Human Design calculates two distinct charts: the Personality chart (exact moment of birth) and the Design chart (calculated ~88 days prior to birth)."
        },
        {
          heading: "What to Do If You Lack an Exact Birth Certificate",
          paragraphs: [
            "If your birth time is uncertain within a window (for example, 'sometime in the afternoon between 2 PM and 5 PM'), we run interval casts across the entire timeframe.",
            "Often, the core energy type and authority remain stable throughout the window, while specific gate nuances can be clarified through experiential experimentation."
          ]
        }
      ],
      takeaways: [
        "Exact birth time ensures precise line, gate, and channel calculations.",
        "The Moon moves rapidly, changing gates every few hours.",
        "Estimated birth times can still reveal your foundational Type and Strategy."
      ]
    }
  },
  {
    slug: "deconditioning-the-open-heart",
    tag: "Deconditioning · 7 min",
    category: "Deconditioning",
    readTime: "7 min",
    date: "Jul 20, 2026",
    author: "Nine Centres Editorial",
    title: "Deconditioning the open ego & willpower centre",
    excerpt: "Why 65% of humanity has nothing to prove and how trying to prove self-worth burns out your nervous system.",
    content: {
      intro: "The Heart (Ego) Centre is the motor of willpower, material ambition, and self-worth. In approximately 65% of the population, this centre is completely open. Yet modern corporate culture is engineered entirely around competitive willpower.",
      sections: [
        {
          heading: "The Not-Self Trap of the Open Heart",
          paragraphs: [
            "When the Ego centre is undefined, the Not-Self voice constantly whispers: 'I have to prove that I am valuable, capable, and worthy of love.'",
            "This leads to making unsustainable promises, working 80-hour weeks out of guilt, and overcompensating by discounting services or giving away labor for free."
          ],
          highlight: "You have zero biological willpower to sustain forced discipline, and that is by design. Your worth is inherent, not manufactured."
        }
      ],
      takeaways: [
        "Never make willpower-based binding promises when your Heart is open.",
        "Your self-worth does not depend on performance or productivity.",
        "Rest when you are tired; avoid manufactured hustle."
      ]
    }
  },
  {
    slug: "projector-guide-to-recognition",
    tag: "Types · 9 min",
    category: "Types",
    readTime: "9 min",
    date: "Jul 15, 2026",
    author: "Nine Centres Editorial",
    title: "The Projector's guide to genuine recognition",
    excerpt: "Why waiting for the invitation is not passive waiting, and how mastering your specific system makes recognition effortless.",
    content: {
      intro: "Projectors represent roughly 20% of humanity. As non-energy types, they do not possess a defined Sacral motor. Their biological gift is not building or generating; it is seeing systems, directing energy, and guiding others.",
      sections: [
        {
          heading: "The Anatomy of a True Invitation",
          paragraphs: [
            "A valid invitation requires three components: recognition of your specific genius, an explicit energetic ask, and the freedom for you to accept or decline without penalty.",
            "Offering unsolicited advice before being invited triggers resistance from others and deep bitterness in the Projector."
          ],
          highlight: "Waiting for the invitation is active mastery: study your system, refine your craft, and let your aura naturally draw the right people."
        }
      ],
      takeaways: [
        "Save your guidance for those who explicitly ask and recognise you.",
        "Rest and study are productive foundations for Projector life.",
        "Bitterness is the indicator that you are pushing without an invitation."
      ]
    }
  },
  {
    slug: "emotional-clarity-across-the-wave",
    tag: "Authority · 8 min",
    category: "Authority",
    readTime: "8 min",
    date: "Jul 05, 2026",
    author: "Nine Centres Editorial",
    title: "Emotional clarity across the wave",
    excerpt: "For emotional authority charts, there is no truth in the now. How to ride the emotional wave from high to low to reach 80% clarity.",
    content: {
      intro: "About 50% of the world has a defined Solar Plexus, making Emotional Authority the most common inner decision-making authority on Earth. The golden rule for emotional beings is simple: there is never truth in the spontaneous present moment.",
      sections: [
        {
          heading: "How the Emotional Wave Operates",
          paragraphs: [
            "The Solar Plexus operates like a rhythmic pendulum, oscillating continuously between optimism/hope (the high wave) and melancholic depth/caution (the low wave).",
            "Making decisions at the peak of the wave leads to committing to things you later regret; making decisions in the trough leads to rejecting opportunities out of temporary gloom."
          ],
          highlight: "Sleep on big decisions. When you look at an opportunity across multiple mood states and it still feels sound, you have reached emotional clarity."
        }
      ],
      takeaways: [
        "Never commit on the spot during emotional highs or lows.",
        "Clarity is not 100% certainty; it is a steady ~80% calm knowing over time.",
        "Give yourself permission to say: 'Give me 24 hours to feel into this.'"
      ]
    }
  }
];

export const getArticleBySlug = (slug: string): BlogArticle | undefined =>
  BLOG_ARTICLES.find((a) => a.slug === slug);
