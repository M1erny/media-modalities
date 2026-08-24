export type ModalityArchetype = 
  | 'Algorithmic Attention Sink'
  | 'High-Agency Sandbox'
  | 'Deep Focus Moat'
  | 'Physical Reality Immersion'
  | 'High-CapEx Spectacle'
  | 'Ambient Stream';

export interface FinancialMetrics {
  capex: number;          // Supply-side Production Cost / Complexity barrier (0-100)
  attentionYield: number; // Throughput Attention Conversion ROI & Capture Velocity (0-100)
  retentionMoat: number;  // Defensibility Stickiness, Switching Costs & LTV (0-100)
  tamRating: 'Micro' | 'Small' | 'Medium' | 'Large' | 'Massive';
  globalTamBillions: number; // Estimated global market addressable revenue ($B USD)
  archetype: ModalityArchetype;
  thesis: string;
  risks: string;
}

export interface SensoryComposition {
  visual: number;    // % visual engagement (0-100)
  auditory: number;  // % auditory engagement (0-100)
  physical: number;  // % physical/tactile/proprioceptive engagement (0-100)
}

export interface Modality {
  id: string;
  name: string;
  ticker: string;
  cognitiveLoad: number;      // x axis (biological): Working memory & CPU effort (0-100)
  systemicAgency: number;     // y axis (biological): User motor output & feedback control (0-100)
  sensoryUtilization: number;  // z axis (biological): Bandwidth of sensory channels engaged (0-100)
  sensoryComposition: SensoryComposition;
  financialMetrics: FinancialMetrics;
}

export const modalitiesData: Modality[] = [
  {
    id: "short_form_video",
    name: "Short-form Video (TikTok/Reels)",
    ticker: "SFV",
    cognitiveLoad: 10,
    systemicAgency: 20,
    sensoryUtilization: 70,
    sensoryComposition: { visual: 55, auditory: 35, physical: 10 },
    financialMetrics: {
      capex: 5,
      attentionYield: 98,
      retentionMoat: 95,
      tamRating: "Massive",
      globalTamBillions: 185,
      archetype: "Algorithmic Attention Sink",
      thesis: "Zero-barrier continuous variable reward loop. Hyper-personalized algorithmic graph yields the highest monetization velocity and daily minutes per user in human history.",
      risks: "Geopolitical regulatory bans, severe cognitive saturation, generational attention degradation."
    }
  },
  {
    id: "social_media",
    name: "Social Media Feeds (X/IG)",
    ticker: "SOC",
    cognitiveLoad: 20,
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
      thesis: "Near-zero COGS via user-generated content (UGC). Social graph lock-in and notification-driven micro-sessions establish dominant habitual mindshare.",
      risks: "Platform fatigue, antitrust scrutiny, ad-targeting depreciation via privacy frameworks."
    }
  },
  {
    id: "irl_streaming",
    name: "IRL Live Streaming (Twitch/Kick)",
    ticker: "IRL",
    cognitiveLoad: 25,
    systemicAgency: 50,
    sensoryUtilization: 50,
    sensoryComposition: { visual: 50, auditory: 45, physical: 5 },
    financialMetrics: {
      capex: 10,
      attentionYield: 88,
      retentionMoat: 88,
      tamRating: "Large",
      globalTamBillions: 42,
      archetype: "Algorithmic Attention Sink",
      thesis: "Hyper-intense parasocial community dynamics. Delivers 4-8 hours of secondary-screen user retention with sub-linear creator production costs.",
      risks: "Creator burnout, unpredictable creator conduct liability, programmatic monetization frictions."
    }
  },
  {
    id: "gen_ai",
    name: "Gen AI Prompting & Co-Creation",
    ticker: "GAI",
    cognitiveLoad: 70,
    systemicAgency: 90,
    sensoryUtilization: 20,
    sensoryComposition: { visual: 75, auditory: 5, physical: 20 },
    financialMetrics: {
      capex: 75,
      attentionYield: 85,
      retentionMoat: 92,
      tamRating: "Massive",
      globalTamBillions: 130,
      archetype: "High-Agency Sandbox",
      thesis: "High compute training capex offset by zero-marginal-cost inference and exponential agency. Transforming passive consumers into interactive directors.",
      risks: "Inference compute cost pressures, rapid foundation model commoditization, IP litigation."
    }
  },
  {
    id: "video_games_open",
    name: "Video Games (Open World MMO)",
    ticker: "VGO",
    cognitiveLoad: 65,
    systemicAgency: 85,
    sensoryUtilization: 85,
    sensoryComposition: { visual: 45, auditory: 30, physical: 25 },
    financialMetrics: {
      capex: 90,
      attentionYield: 82,
      retentionMoat: 88,
      tamRating: "Large",
      globalTamBillions: 95,
      archetype: "High-Agency Sandbox",
      thesis: "Virtual alternate reality sandbox. Multi-year monetization tailwinds via expansions, microtransactions, and player social networks justify steep upfront CapEx.",
      risks: "Extreme development cycles (5-7 years), catastrophic live-ops launch risks."
    }
  },
  {
    id: "tabletop_rpgs",
    name: "Tabletop RPGs (D&D/Pathfinder)",
    ticker: "TRP",
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
      thesis: "Maximum systemic agency with peer-driven emergent narrative. Negligible production overhead paired with high-margin core rulebooks and virtual tabletop ecosystems.",
      risks: "Licensing controversies, high onboarding friction, scheduling logistics."
    }
  },
  {
    id: "video_games_grand",
    name: "Video Games (Grand Strategy/Sim)",
    ticker: "STR",
    cognitiveLoad: 95,
    systemicAgency: 95,
    sensoryUtilization: 30,
    sensoryComposition: { visual: 65, auditory: 15, physical: 20 },
    financialMetrics: {
      capex: 45,
      attentionYield: 45,
      retentionMoat: 95,
      tamRating: "Small",
      globalTamBillions: 12,
      archetype: "Deep Focus Moat",
      thesis: "Infinite emergent combinatorial replayability. Minimalist graphical requirements offset by astronomical customer lifetime value (LTV) and near-zero churn.",
      risks: "Extremely steep onboarding learning curves, niche addressable TAM."
    }
  },
  {
    id: "interactive_learning",
    name: "Interactive E-Learning (Duolingo/Codecademy)",
    ticker: "ELN",
    cognitiveLoad: 75,
    systemicAgency: 80,
    sensoryUtilization: 40,
    sensoryComposition: { visual: 65, auditory: 15, physical: 20 },
    financialMetrics: {
      capex: 55,
      attentionYield: 60,
      retentionMoat: 85,
      tamRating: "Large",
      globalTamBillions: 65,
      archetype: "Deep Focus Moat",
      thesis: "Gamified streak psychology combined with aspirational self-improvement drives predictable high-margin SaaS subscription cash flows.",
      risks: "Skill plateau churn, disintermediation by conversational LLM agents."
    }
  },
  {
    id: "interactive_fiction",
    name: "Interactive Fiction & Visual Novels",
    ticker: "INF",
    cognitiveLoad: 75,
    systemicAgency: 80,
    sensoryUtilization: 15,
    sensoryComposition: { visual: 80, auditory: 5, physical: 15 },
    financialMetrics: {
      capex: 15,
      attentionYield: 70,
      retentionMoat: 65,
      tamRating: "Small",
      globalTamBillions: 6,
      archetype: "Deep Focus Moat",
      thesis: "Hyper-efficient text-and-branching engine economics. Intense fandom monetization with zero 3D rendering pipeline overhead.",
      risks: "Saturated self-publishing storefronts, narrow regional appeal."
    }
  },
  {
    id: "podcasts",
    name: "Podcasts & Audiobooks",
    ticker: "AUD",
    cognitiveLoad: 30,
    systemicAgency: 5,
    sensoryUtilization: 20,
    sensoryComposition: { visual: 0, auditory: 95, physical: 5 },
    financialMetrics: {
      capex: 15,
      attentionYield: 80,
      retentionMoat: 70,
      tamRating: "Large",
      globalTamBillions: 38,
      archetype: "Ambient Stream",
      thesis: "Uniquely captures secondary ambient attention during transit, fitness, and domestic chores. High intimacy host endorsements drive elite ad pricing.",
      risks: "Supply hyper-saturation, platform fragmentation, programmatic measurement limits."
    }
  },
  {
    id: "ambient_music",
    name: "Ambient & Functional Audio",
    ticker: "AMB",
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
      thesis: "Near-zero cognitive friction utility asset. Provides non-intrusive focus and sleep acoustic masking for hundreds of uninterrupted hours.",
      risks: "Streaming royalty pool restructuring, AI-generated track commoditization."
    }
  },
  {
    id: "audio_assistants",
    name: "Voice Assistants & Smart Audio",
    ticker: "IVA",
    cognitiveLoad: 50,
    systemicAgency: 70,
    sensoryUtilization: 20,
    sensoryComposition: { visual: 0, auditory: 85, physical: 15 },
    financialMetrics: {
      capex: 25,
      attentionYield: 50,
      retentionMoat: 45,
      tamRating: "Medium",
      globalTamBillions: 18,
      archetype: "Ambient Stream",
      thesis: "Hands-free ambient interface for domestic coordination, audio control, and micro-queries.",
      risks: "Absence of screen real estate limits monetization surfaces, high skill abandonment."
    }
  },
  {
    id: "movies",
    name: "Feature Films / Cinema",
    ticker: "MVI",
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
      thesis: "Cultural flagship IP generation. High upfront theatrical event prestige creates multi-decade franchise licensing moats.",
      risks: "Ballooning production budgets ($250M+), collapsing post-theatrical window economics."
    }
  },
  {
    id: "tv_series",
    name: "Prestige Episodic TV",
    ticker: "STG",
    cognitiveLoad: 45,
    systemicAgency: 5,
    sensoryUtilization: 70,
    sensoryComposition: { visual: 60, auditory: 40, physical: 0 },
    financialMetrics: {
      capex: 80,
      attentionYield: 65,
      retentionMoat: 68,
      tamRating: "Large",
      globalTamBillions: 110,
      archetype: "High-CapEx Spectacle",
      thesis: "Recurring multi-week watercooler narrative hooks anchor streaming subscriber cohorts against churn.",
      risks: "Content library saturation, rising talent wage inflation, subscriber price sensitivity."
    }
  },
  {
    id: "video_games_linear",
    name: "Video Games (Cinematic Linear)",
    ticker: "VGL",
    cognitiveLoad: 60,
    systemicAgency: 65,
    sensoryUtilization: 80,
    sensoryComposition: { visual: 50, auditory: 30, physical: 20 },
    financialMetrics: {
      capex: 70,
      attentionYield: 75,
      retentionMoat: 55,
      tamRating: "Medium",
      globalTamBillions: 48,
      archetype: "High-CapEx Spectacle",
      thesis: "Pinnacle sensory audiovisual immersion and active narrative pacing commanding premium $70 retail pricing.",
      risks: "Limited replayability once completed, ballooning development cost vs short sales windows."
    }
  },
  {
    id: "live_theater",
    name: "Live Stage Theater & Broadway",
    ticker: "THR",
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
      thesis: "Irreplaceable real-time human performance exclusivity enabling exorbitant ticket pricing power.",
      risks: "Physical seat capacity ceilings, high operating leverage, sensitivity to local tourism."
    }
  },
  {
    id: "television_theater",
    name: "Television Theater & Broadcast Stage",
    ticker: "TTV",
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
      thesis: "Bridges intellectual stage drama with broadcast reach for elite cultural audience cohorts.",
      risks: "Demographic aging of viewers, reliance on state public media funding."
    }
  },
  {
    id: "larp",
    name: "Live Action Role Play (LARP)",
    ticker: "LRP",
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
      thesis: "The absolute sensory benchmark. Real-world physical weather, tangible props, and visceral embodiment drive unmatched participant retention.",
      risks: "Extreme logistical coordinate friction, non-scalable operational model."
    }
  },
  {
    id: "theme_park_rides",
    name: "Theme Park Multi-Sensory Rides",
    ticker: "TPK",
    cognitiveLoad: 15,
    systemicAgency: 5,
    sensoryUtilization: 95,
    sensoryComposition: { visual: 30, auditory: 20, physical: 50 },
    financialMetrics: {
      capex: 98,
      attentionYield: 58,
      retentionMoat: 78,
      tamRating: "Medium",
      globalTamBillions: 75,
      archetype: "Physical Reality Immersion",
      thesis: "Insurmountable capital barrier moat. Combines physical G-forces, moisture, dynamic motion, and IP worldbuilding to anchor global resort empires.",
      risks: "Multi-decade capital payback horizons, macro tourism cyclicality, safety liabilities."
    }
  },
  {
    id: "escape_rooms",
    name: "Physical Escape Rooms",
    ticker: "ESC",
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
      thesis: "Tactile spatial problem-solving in physical space yielding strong local team-building cash flows.",
      risks: "Zero replayability per player per room design, high commercial real estate overheads."
    }
  },
  {
    id: "vr_experiences",
    name: "Virtual Reality (VR/Spatial)",
    ticker: "VRX",
    cognitiveLoad: 70,
    systemicAgency: 75,
    sensoryUtilization: 80,
    sensoryComposition: { visual: 50, auditory: 35, physical: 15 },
    financialMetrics: {
      capex: 80,
      attentionYield: 68,
      retentionMoat: 45,
      tamRating: "Small",
      globalTamBillions: 22,
      archetype: "Physical Reality Immersion",
      thesis: "Highest digital presence medium. Encapsulated head-mounted display isolates peripheral distractions for complete attention capture.",
      risks: "Hardware weight & friction, visual fatigue, fragmented spatial app ecosystems."
    }
  },
  {
    id: "books",
    name: "Books (Fiction Literature)",
    ticker: "FIC",
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
      thesis: "Asymmetrical imagination engine where semantic tokens trigger high-resolution internal neural rendering with negligible distribution costs.",
      risks: "Rising leisure time opportunity costs, decline in deep sustained literacy hours."
    }
  },
  {
    id: "textbooks",
    name: "Textbooks / Non-Fiction",
    ticker: "NFX",
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
      thesis: "Structured domain knowledge authority historically protected by academic curriculum adoption moats.",
      risks: "Rapid disintermediation by interactive AI tutors and multimodal synthesis engines."
    }
  },
  {
    id: "comic_books",
    name: "Comic Books & Manga",
    ticker: "MNG",
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
      thesis: "Elite incubation engine for global multimedia IP franchises (Marvel, Shonen Jump) with durable fandom loyalty.",
      risks: "Scanlation piracy, artist attrition, distribution channel consolidation."
    }
  },
  {
    id: "digital_art_nfts",
    name: "Digital Art & Web3 Collectibles",
    ticker: "NFT",
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
      thesis: "Financialized digital status signaling and online provenance anchoring niche collector attention.",
      risks: "Speculative liquidity drawdowns, regulatory headwinds, low intrinsic utility."
    }
  }
];
