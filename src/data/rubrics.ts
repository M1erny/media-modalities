/**
 * Anchored rubrics. Every 0–100 score in modalities.ts is set against these anchors,
 * so a score can be argued with by pointing at an anchor.
 */

export interface Rubric {
  key: string;
  name: string;
  lens: 'Biological' | 'Economic';
  question: string;
  anchors: { score: number; text: string }[];
}

export const RUBRICS: Rubric[] = [
  {
    key: 'cognitiveLoad',
    name: 'Cognitive load',
    lens: 'Biological',
    question: 'How much mental effort does it take to follow and enjoy it?',
    anchors: [
      { score: 0, text: 'Runs fully in the background (music in a shop).' },
      { score: 25, text: 'Light; easy to dip in and out of (a feed, a casual game, a ride).' },
      { score: 50, text: 'Focused but easy; follows a story or a conversation (a TV drama, a podcast).' },
      { score: 75, text: 'Sustained concentration; holds a lot in mind (a novel, a strategy game, a play).' },
      { score: 100, text: 'Expert-level effort (dense non-fiction, competitive play, complex rules).' },
    ],
  },
  {
    key: 'agency',
    name: 'Agency',
    lens: 'Biological',
    question: "How much do the person's choices change what happens next?",
    anchors: [
      { score: 0, text: 'Fixed sequence; you can only stop it (cinema, radio).' },
      { score: 25, text: 'You choose what comes next (a catalogue, a feed, a playlist).' },
      { score: 50, text: 'You shape it within limits (chat with a streamer, place a bet).' },
      { score: 75, text: 'Real-time control of a world (a console game, an escape room).' },
      { score: 100, text: 'Open-ended co-creation; it is made with you (AI chat, a tabletop RPG).' },
    ],
  },
  {
    key: 'sensoryBandwidth',
    name: 'Sensory bandwidth',
    lens: 'Biological',
    question: "How much of the senses' capacity does it fill? Physical reality is the ceiling.",
    anchors: [
      { score: 5, text: 'Static symbols only (text).' },
      { score: 25, text: 'One rich channel (audio) or still images.' },
      { score: 50, text: 'Audio-visual on a phone-size screen.' },
      { score: 65, text: 'Audio-visual on a large screen at home.' },
      { score: 78, text: 'Immersive audio-visual (cinema, VR).' },
      { score: 90, text: 'Live in the room (concert, theatre, stadium).' },
      { score: 100, text: 'Full-body physical (rides, escape rooms).' },
    ],
  },
  {
    key: 'supplyCost',
    name: 'Supply cost',
    lens: 'Economic',
    question:
      'What does one hour of new experience cost to make at a professional standard (first-copy cost)? Log scale, computed from the $/hour estimate.',
    anchors: [
      { score: 0, text: '$100 per hour or less (user-generated posts, AI generation on demand).' },
      { score: 17, text: '$1k per hour (a solo podcast, newsletter or stream).' },
      { score: 33, text: '$10k per hour (a trade book, a news desk).' },
      { score: 50, text: '$100k per hour (a music album, a mobile game).' },
      { score: 67, text: '$1M per hour (a PC game, a stage production).' },
      { score: 83, text: '$10M per hour (a feature film, a top-flight sports match).' },
      { score: 100, text: '$100M per hour (a blockbuster, a new theme-park land).' },
    ],
  },
  {
    key: 'moat',
    name: 'Platform moat',
    lens: 'Economic',
    question:
      'How hard is it to dislodge the leading platform or operator? Scored at the platform layer, since a format itself can be copied.',
    anchors: [
      { score: 0, text: 'No lock-in; many substitutes, switching is free.' },
      { score: 25, text: 'Brand preference only (a radio station, a cinema chain).' },
      { score: 50, text: 'Library or habit lock-in (a streaming subscription, a Kindle library).' },
      { score: 75, text: 'Network effects, exclusive IP or scarce assets (Steam, a sports league).' },
      { score: 100, text: 'Identity plus a social graph plus a multi-sided network (social networks).' },
    ],
  },
  {
    key: 'aiExposure',
    name: 'AI exposure',
    lens: 'Economic',
    question: 'What share of the supply cost can AI take over by 2030?',
    anchors: [
      { score: 0, text: 'The core is physical or live; AI cannot make it.' },
      { score: 25, text: 'AI assists production at the edges.' },
      { score: 50, text: 'AI can make large parts of it.' },
      { score: 75, text: 'AI can make most of it at professional quality.' },
      { score: 100, text: 'The content is generated on demand.' },
    ],
  },
];

/**
 * Scenario used for the 2030 view: AI divides supply cost by 10^(2 × exposure).
 * Exposure 50 → 10× cheaper, 100 → 100× cheaper, 10 → about 1.6× cheaper.
 * This is an assumption to make the direction visible, not a forecast.
 */
export const AI_COST_DECADES_AT_FULL_EXPOSURE = 2;
