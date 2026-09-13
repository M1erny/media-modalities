export type ModalityArchetype = 
  | 'Algorithmic Attention Sink'
  | 'High-Agency Sandbox'
  | 'Deep Focus Moat'
  | 'Physical Reality Immersion'
  | 'High-CapEx Spectacle'
  | 'Ambient Stream';

export type ModalityFamily = 
  | 'Interactive Gaming'
  | 'Audio & Acoustic'
  | 'Linear Audiovisual'
  | 'Physical & Spatial'
  | 'Text & Symbolic'
  | 'Generative & Co-Creation';

export const FAMILY_CONFIG: Record<ModalityFamily, { color: string; icon: string; description: string }> = {
  'Interactive Gaming': {
    color: '#a855f7', // Vivid Violet
    icon: '🎮',
    description: 'Closed-loop virtual state simulations with real-time player cybernetic feedback.'
  },
  'Audio & Acoustic': {
    color: '#f59e0b', // Warm Amber
    icon: '🎧',
    description: 'Cochlear sound wave transmission capturing ambient and dedicated auditory attention.'
  },
  'Linear Audiovisual': {
    color: '#06b6d4', // Cyan
    icon: '📺',
    description: 'Synchronized stream of moving imagery and sound in a unidirectional broadcast.'
  },
  'Physical & Spatial': {
    color: '#10b981', // Emerald Green
    icon: '🖐️',
    description: 'Embodied multi-sensory presence involving physical space, vestibular motion, and tactile matter.'
  },
  'Text & Symbolic': {
    color: '#38bdf8', // Sky Blue
    icon: '📚',
    description: 'Abstract static symbolic glyphs decoded via left-hemisphere phonological compute.'
  },
  'Generative & Co-Creation': {
    color: '#f43f5e', // Neon Rose
    icon: '🤖',
    description: 'Dynamic conversational and prompt-driven generative synthesis and emergent learning.'
  }
};

export interface FinancialMetrics {
  capex: number;          // Supply-side Capital Intensity / Production Cost (0-100)
  attentionYield: number; // Monetization & Capture Velocity per unit of time (0-100)
  retentionMoat: number;  // Defensibility, Switching Costs & Customer LTV (0-100)
  tamRating: 'Micro' | 'Small' | 'Medium' | 'Large' | 'Massive';
  globalTamBillions: number; // Global annual addressable market ($B USD)
  archetype: ModalityArchetype;
  thesis: string;
  risks: string;
}

export interface SensoryComposition {
  visual: number;    // % visual photons (0-100)
  auditory: number;  // % acoustic waves (0-100)
  physical: number;  // % somatosensory / haptic / vestibular (0-100)
}

export interface Modality {
  id: string;
  name: string;
  ticker: string;
  family: ModalityFamily;
  cognitiveLoad: number;      // x axis (biological): Cortical compute / working memory cost (0-100)
  systemicAgency: number;     // y axis (biological): Closed-loop motor feedback control (0-100)
  sensoryUtilization: number;  // z axis (biological): Perceptual channel bandwidth (0-100)
  sensoryComposition: SensoryComposition;
  financialMetrics: FinancialMetrics;
}

export const modalitiesData: Modality[] = [
  /* ── 1. INTERACTIVE GAMING (4) ── */
  {
    id: "video_games_open",
    name: "Open-World MMOs",
    ticker: "VGO",
    family: "Interactive Gaming",
    cognitiveLoad: 65,
    systemicAgency: 85,
    sensoryUtilization: 85,
    sensoryComposition: { visual: 45, auditory: 30, physical: 25 },
    financialMetrics: {
      capex: 90,
      attentionYield: 82,
      retentionMoat: 92,
      tamRating: "Large",
      globalTamBillions: 95,
      archetype: "High-Agency Sandbox",
      thesis: "Persistent alternate reality sandbox. Massive upfront CapEx is amortized over multi-year expansions, microtransactions, and social guild lock-in.",
      risks: "Extreme 5-7 year development cycles, catastrophic live-service churn risk at launch."
    }
  },
  {
    id: "video_games_grand",
    name: "Grand Strategy Games",
    ticker: "STR",
    family: "Interactive Gaming",
    cognitiveLoad: 95,
    systemicAgency: 95,
    sensoryUtilization: 30,
    sensoryComposition: { visual: 65, auditory: 15, physical: 20 },
    financialMetrics: {
      capex: 45,
      attentionYield: 45,
      retentionMoat: 96,
      tamRating: "Small",
      globalTamBillions: 12,
      archetype: "Deep Focus Moat",
      thesis: "Infinite combinatorial decision trees. High intellectual cognitive barrier produces extraordinary customer LTV and near-zero voluntary churn.",
      risks: "Steep onboarding curve, small addressable user base."
    }
  },
  {
    id: "video_games_linear",
    name: "Cinematic Action Games",
    ticker: "VGL",
    family: "Interactive Gaming",
    cognitiveLoad: 60,
    systemicAgency: 65,
    sensoryUtilization: 80,
    sensoryComposition: { visual: 50, auditory: 30, physical: 20 },
    financialMetrics: {
      capex: 75,
      attentionYield: 75,
      retentionMoat: 55,
      tamRating: "Medium",
      globalTamBillions: 48,
      archetype: "High-CapEx Spectacle",
      thesis: "Peak audiovisual cinematic fidelity blended with active tactile pacing, commanding premium $70 retail price points.",
      risks: "Zero replay value upon completion, short sales velocity windows."
    }
  },
  {
    id: "interactive_fiction",
    name: "Interactive Fiction",
    ticker: "INF",
    family: "Interactive Gaming",
    cognitiveLoad: 70,
    systemicAgency: 75,
    sensoryUtilization: 20,
    sensoryComposition: { visual: 80, auditory: 5, physical: 15 },
    financialMetrics: {
      capex: 15,
      attentionYield: 65,
      retentionMoat: 65,
      tamRating: "Small",
      globalTamBillions: 6,
      archetype: "Deep Focus Moat",
      thesis: "High agency narrative branching produced at a fraction of 3D gaming CapEx, monetizing intense niche literary fandom.",
      risks: "Saturated storefront distribution, limited mainstream penetration."
    }
  },

  /* ── 2. AUDIO & ACOUSTIC (3) ── */
  {
    id: "podcasts",
    name: "Podcasts",
    ticker: "AUD",
    family: "Audio & Acoustic",
    cognitiveLoad: 30,
    systemicAgency: 5,
    sensoryUtilization: 20,
    sensoryComposition: { visual: 0, auditory: 95, physical: 5 },
    financialMetrics: {
      capex: 15,
      attentionYield: 75,
      retentionMoat: 70,
      tamRating: "Large",
      globalTamBillions: 38,
      archetype: "Ambient Stream",
      thesis: "Monopolizes secondary ambient attention during transit and chores. Direct auditory intimacy commands premium endorsement CPMs.",
      risks: "Supply saturation, fragmented measurement, low programmatic automation."
    }
  },
  {
    id: "ambient_music",
    name: "Ambient Audio",
    ticker: "AMB",
    family: "Audio & Acoustic",
    cognitiveLoad: 5,
    systemicAgency: 0,
    sensoryUtilization: 15,
    sensoryComposition: { visual: 0, auditory: 100, physical: 0 },
    financialMetrics: {
      capex: 5,
      attentionYield: 90,
      retentionMoat: 55,
      tamRating: "Large",
      globalTamBillions: 28,
      archetype: "Ambient Stream",
      thesis: "Pure utility audio masking focus and sleep for uninterrupted hours with zero cognitive friction.",
      risks: "Streaming royalty pool devaluation, AI generative track dilution."
    }
  },
  {
    id: "audio_assistants",
    name: "Voice Assistants",
    ticker: "IVA",
    family: "Audio & Acoustic",
    cognitiveLoad: 45,
    systemicAgency: 70,
    sensoryUtilization: 20,
    sensoryComposition: { visual: 0, auditory: 85, physical: 15 },
    financialMetrics: {
      capex: 25,
      attentionYield: 45,
      retentionMoat: 45,
      tamRating: "Medium",
      globalTamBillions: 18,
      archetype: "Ambient Stream",
      thesis: "Hands-free voice conversational interface for home and vehicle coordination.",
      risks: "Absence of screen monetization surfaces, high skill abandonment rate."
    }
  },

  /* ── 3. LINEAR AUDIOVISUAL (5) ── */
  {
    id: "short_form_video",
    name: "Short-Form Video",
    ticker: "SFV",
    family: "Linear Audiovisual",
    cognitiveLoad: 10,
    systemicAgency: 15,
    sensoryUtilization: 70,
    sensoryComposition: { visual: 55, auditory: 35, physical: 10 },
    financialMetrics: {
      capex: 5,
      attentionYield: 98,
      retentionMoat: 92,
      tamRating: "Massive",
      globalTamBillions: 190,
      archetype: "Algorithmic Attention Sink",
      thesis: "Zero cognitive decoding friction. Algorithmic variable reward loop captures immediate attention with near-zero supply-side production cost.",
      risks: "Severe attention fragmentation, geopolitical platform bans, brand advertiser sensitivity."
    }
  },
  {
    id: "social_media",
    name: "Social Media Feeds",
    ticker: "SOC",
    family: "Linear Audiovisual",
    cognitiveLoad: 25,
    systemicAgency: 45,
    sensoryUtilization: 60,
    sensoryComposition: { visual: 70, auditory: 20, physical: 10 },
    financialMetrics: {
      capex: 5,
      attentionYield: 92,
      retentionMoat: 94,
      tamRating: "Massive",
      globalTamBillions: 240,
      archetype: "Algorithmic Attention Sink",
      thesis: "Zero-cost UGC engine anchored by network effects. Social graph identity lock-in drives daily habitual check-ins across global populations.",
      risks: "Platform fatigue, antitrust regulation, signal decay from algorithmic spam."
    }
  },
  {
    id: "irl_streaming",
    name: "Live Streaming",
    ticker: "IRL",
    family: "Linear Audiovisual",
    cognitiveLoad: 20,
    systemicAgency: 45,
    sensoryUtilization: 50,
    sensoryComposition: { visual: 50, auditory: 45, physical: 5 },
    financialMetrics: {
      capex: 10,
      attentionYield: 85,
      retentionMoat: 88,
      tamRating: "Large",
      globalTamBillions: 42,
      archetype: "Algorithmic Attention Sink",
      thesis: "Hyper-intense parasocial community lock-in. Captures multi-hour secondary screen attention with sub-linear creator equipment overhead.",
      risks: "Creator burnout, unscripted conduct liability, non-programmatic monetization frictions."
    }
  },
  {
    id: "tv_series",
    name: "Prestige TV",
    ticker: "STG",
    family: "Linear Audiovisual",
    cognitiveLoad: 45,
    systemicAgency: 5,
    sensoryUtilization: 70,
    sensoryComposition: { visual: 60, auditory: 40, physical: 0 },
    financialMetrics: {
      capex: 80,
      attentionYield: 65,
      retentionMoat: 70,
      tamRating: "Large",
      globalTamBillions: 110,
      archetype: "High-CapEx Spectacle",
      thesis: "Multi-week episodic narrative hooks anchor streaming subscriber cohorts against quarterly subscription churn.",
      risks: "Content overproduction, talent wage inflation, consumer subscription fatigue."
    }
  },
  {
    id: "movies",
    name: "Feature Films",
    ticker: "MVI",
    family: "Linear Audiovisual",
    cognitiveLoad: 40,
    systemicAgency: 5,
    sensoryUtilization: 75,
    sensoryComposition: { visual: 60, auditory: 40, physical: 0 },
    financialMetrics: {
      capex: 95,
      attentionYield: 55,
      retentionMoat: 35,
      tamRating: "Large",
      globalTamBillions: 80,
      archetype: "High-CapEx Spectacle",
      thesis: "Cultural flagship IP generation. Theatrical prestige establishes franchise IP value amortized over decades across merchandise and parks.",
      risks: "High hit dependency ($250M+ budgets), shrinking post-theatrical distribution windows."
    }
  },

  /* ── 4. PHYSICAL & SPATIAL REALITY (6) ── */
  {
    id: "larp",
    name: "Live Action Role Play",
    ticker: "LRP",
    family: "Physical & Spatial",
    cognitiveLoad: 75,
    systemicAgency: 90,
    sensoryUtilization: 98,
    sensoryComposition: { visual: 30, auditory: 30, physical: 40 },
    financialMetrics: {
      capex: 25,
      attentionYield: 40,
      retentionMoat: 92,
      tamRating: "Micro",
      globalTamBillions: 2,
      archetype: "Physical Reality Immersion",
      thesis: "The empirical ceiling of sensory immersion. Unmediated physical gravity, tactile textures, weather, and embodied presence.",
      risks: "Zero operational scalability, intense logistical coordination friction."
    }
  },
  {
    id: "theme_park_rides",
    name: "Theme Park Rides",
    ticker: "TPK",
    family: "Physical & Spatial",
    cognitiveLoad: 15,
    systemicAgency: 5,
    sensoryUtilization: 95,
    sensoryComposition: { visual: 30, auditory: 20, physical: 50 },
    financialMetrics: {
      capex: 98,
      attentionYield: 58,
      retentionMoat: 80,
      tamRating: "Medium",
      globalTamBillions: 75,
      archetype: "Physical Reality Immersion",
      thesis: "Ultimate capital barrier moat. Physical G-forces, moisture, dynamic kinetics, and IP immersion anchor billion-dollar destination resorts.",
      risks: "Multi-decade capital payback timelines, macroeconomic tourism sensitivity."
    }
  },
  {
    id: "escape_rooms",
    name: "Escape Rooms",
    ticker: "ESC",
    family: "Physical & Spatial",
    cognitiveLoad: 85,
    systemicAgency: 85,
    sensoryUtilization: 90,
    sensoryComposition: { visual: 30, auditory: 15, physical: 55 },
    financialMetrics: {
      capex: 55,
      attentionYield: 55,
      retentionMoat: 25,
      tamRating: "Micro",
      globalTamBillions: 5,
      archetype: "Physical Reality Immersion",
      thesis: "Embodied collaborative physical puzzle-solving yielding profitable local corporate and consumer bookings.",
      risks: "Zero customer replayability once room puzzle is resolved, high commercial real estate rents."
    }
  },
  {
    id: "live_theater",
    name: "Live Theater",
    ticker: "THR",
    family: "Physical & Spatial",
    cognitiveLoad: 55,
    systemicAgency: 5,
    sensoryUtilization: 60,
    sensoryComposition: { visual: 50, auditory: 45, physical: 5 },
    financialMetrics: {
      capex: 65,
      attentionYield: 40,
      retentionMoat: 60,
      tamRating: "Micro",
      globalTamBillions: 14,
      archetype: "High-CapEx Spectacle",
      thesis: "Irreplaceable real-time human presence and physical acoustic staging commanding high premium ticket yields.",
      risks: "Fixed seating capacity ceiling, high physical operating leverage."
    }
  },
  {
    id: "television_theater",
    name: "Broadcast Theater",
    ticker: "TTV",
    family: "Physical & Spatial",
    cognitiveLoad: 65,
    systemicAgency: 5,
    sensoryUtilization: 45,
    sensoryComposition: { visual: 60, auditory: 40, physical: 0 },
    financialMetrics: {
      capex: 30,
      attentionYield: 35,
      retentionMoat: 55,
      tamRating: "Small",
      globalTamBillions: 4,
      archetype: "High-CapEx Spectacle",
      thesis: "Bridges intellectual stage dialogue with broadcast reach for dedicated cultural audience cohorts.",
      risks: "Demographic audience aging, reliance on state public media funding."
    }
  },
  {
    id: "vr_experiences",
    name: "Virtual Reality",
    ticker: "VRX",
    family: "Physical & Spatial",
    cognitiveLoad: 70,
    systemicAgency: 75,
    sensoryUtilization: 80,
    sensoryComposition: { visual: 50, auditory: 35, physical: 15 },
    financialMetrics: {
      capex: 80,
      attentionYield: 65,
      retentionMoat: 45,
      tamRating: "Small",
      globalTamBillions: 22,
      archetype: "Physical Reality Immersion",
      thesis: "Highest digital presence medium. Enclosed head-mounted display completely blocks peripheral real-world distractions.",
      risks: "Headset ergonomics and weight friction, visual nausea, fragmented app ecosystem."
    }
  },

  /* ── 5. TEXT & SYMBOLIC (3) ── */
  {
    id: "books",
    name: "Fiction Books",
    ticker: "FIC",
    family: "Text & Symbolic",
    cognitiveLoad: 80,
    systemicAgency: 5,
    sensoryUtilization: 5,
    sensoryComposition: { visual: 90, auditory: 0, physical: 10 },
    financialMetrics: {
      capex: 15,
      attentionYield: 35,
      retentionMoat: 75,
      tamRating: "Medium",
      globalTamBillions: 32,
      archetype: "Deep Focus Moat",
      thesis: "Asymmetrical imagination engine. Minimalist abstract glyphs trigger internal high-resolution neural rendering with near-zero reproduction costs.",
      risks: "High cognitive effort competing against frictionless digital video feeds."
    }
  },
  {
    id: "textbooks",
    name: "Non-Fiction Books",
    ticker: "NFX",
    family: "Text & Symbolic",
    cognitiveLoad: 90,
    systemicAgency: 5,
    sensoryUtilization: 5,
    sensoryComposition: { visual: 90, auditory: 0, physical: 10 },
    financialMetrics: {
      capex: 30,
      attentionYield: 20,
      retentionMoat: 85,
      tamRating: "Small",
      globalTamBillions: 16,
      archetype: "Deep Focus Moat",
      thesis: "High-density domain knowledge transmission historically protected by academic curriculum adoption moats.",
      risks: "Disintermediation by multimodal AI synthesis and interactive tutors."
    }
  },
  {
    id: "comic_books",
    name: "Comic Books",
    ticker: "MNG",
    family: "Text & Symbolic",
    cognitiveLoad: 50,
    systemicAgency: 5,
    sensoryUtilization: 35,
    sensoryComposition: { visual: 90, auditory: 0, physical: 10 },
    financialMetrics: {
      capex: 35,
      attentionYield: 60,
      retentionMoat: 80,
      tamRating: "Medium",
      globalTamBillions: 26,
      archetype: "Deep Focus Moat",
      thesis: "Efficient global IP incubation pipeline. Low consumption friction paired with deep character fandom creates high adaptation equity.",
      risks: "Digital piracy, creative talent retention, distribution aggregation."
    }
  },

  /* ── 6. GENERATIVE & CO-CREATION (4) ── */
  {
    id: "gen_ai",
    name: "Generative AI",
    ticker: "GAI",
    family: "Generative & Co-Creation",
    cognitiveLoad: 70,
    systemicAgency: 95,
    sensoryUtilization: 25,
    sensoryComposition: { visual: 75, auditory: 5, physical: 20 },
    financialMetrics: {
      capex: 80,
      attentionYield: 85,
      retentionMoat: 90,
      tamRating: "Massive",
      globalTamBillions: 130,
      archetype: "High-Agency Sandbox",
      thesis: "Infinite creative feedback loop. User commands state transformation with instant visual/textual synthesis, achieving peak agency.",
      risks: "Inference compute cost pressure, model commoditization, copyright litigation."
    }
  },
  {
    id: "interactive_learning",
    name: "Interactive E-Learning",
    ticker: "ELN",
    family: "Generative & Co-Creation",
    cognitiveLoad: 75,
    systemicAgency: 80,
    sensoryUtilization: 40,
    sensoryComposition: { visual: 65, auditory: 15, physical: 20 },
    financialMetrics: {
      capex: 50,
      attentionYield: 60,
      retentionMoat: 85,
      tamRating: "Large",
      globalTamBillions: 65,
      archetype: "Deep Focus Moat",
      thesis: "Self-improvement psychology coupled with daily gamified streak retention drives resilient recurring SaaS cash flows.",
      risks: "Skill plateau drop-off, AI conversational tutor disintermediation."
    }
  },
  {
    id: "tabletop_rpgs",
    name: "Tabletop RPGs",
    ticker: "TRP",
    family: "Generative & Co-Creation",
    cognitiveLoad: 85,
    systemicAgency: 100,
    sensoryUtilization: 30,
    sensoryComposition: { visual: 30, auditory: 60, physical: 10 },
    financialMetrics: {
      capex: 10,
      attentionYield: 50,
      retentionMoat: 90,
      tamRating: "Small",
      globalTamBillions: 8,
      archetype: "High-Agency Sandbox",
      thesis: "Unbounded human collective imagination. Zero rendering CapEx paired with profound peer social commitments and lifetime rulebook collector value.",
      risks: "High onboarding friction, scheduling logistics, niche addressable market."
    }
  },
  {
    id: "digital_art_nfts",
    name: "Digital Collectibles",
    ticker: "NFT",
    family: "Generative & Co-Creation",
    cognitiveLoad: 40,
    systemicAgency: 35,
    sensoryUtilization: 25,
    sensoryComposition: { visual: 90, auditory: 5, physical: 5 },
    financialMetrics: {
      capex: 20,
      attentionYield: 45,
      retentionMoat: 65,
      tamRating: "Small",
      globalTamBillions: 9,
      archetype: "Deep Focus Moat",
      thesis: "Financialized digital status signaling and cryptographic provenance anchoring niche community loyalty.",
      risks: "Severe speculative liquidity volatility, low non-financial utility."
    }
  }
];

/**
 * Pure Mathematical Pareto Frontier Calculation
 * Identifies the non-dominated assets where no other asset offers higher outputs for <= input cost.
 */
export function getParetoFrontier(modalities: Modality[], viewMode: 'biological' | 'economic'): Modality[] {
  interface NodePoint {
    modality: Modality;
    x: number;
    y: number;
    z: number;
    compositeScore: number;
  }

  const data: NodePoint[] = modalities.map(m => {
    if (viewMode === 'economic') {
      const x = m.financialMetrics.capex;
      const y = m.financialMetrics.attentionYield;
      const z = m.financialMetrics.retentionMoat;
      return { modality: m, x, y, z, compositeScore: y * 0.55 + z * 0.45 };
    } else {
      const x = m.cognitiveLoad;
      const y = m.systemicAgency;
      const z = m.sensoryUtilization;
      return { modality: m, x, y, z, compositeScore: y * 0.5 + z * 0.5 };
    }
  });

  // An asset P is Pareto-dominated if there exists Q with Q.x <= P.x AND Q.y >= P.y AND Q.z >= P.z (with at least one strict inequality)
  const nonDominated = data.filter(p => {
    const isDominated = data.some(q => 
      q.modality.id !== p.modality.id &&
      q.x <= p.x &&
      q.y >= p.y &&
      q.z >= p.z &&
      (q.x < p.x || q.y > p.y || q.z > p.z)
    );
    return !isDominated;
  });

  // Sort ascending by input cost X
  return nonDominated.sort((a, b) => a.x - b.x).map(n => n.modality);
}
