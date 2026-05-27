export interface FinancialMetrics {
  capex: number;          // Production cost/Complexity (0-100)
  attentionYield: number; // Attention Capture ROI (0-100)
  retentionMoat: number;  // Stickiness/LTV (0-100)
  tamRating: 'Micro' | 'Small' | 'Medium' | 'Large' | 'Massive';
  recommendation: 'STRONG BUY' | 'BUY' | 'HOLD' | 'UNDERPERFORM' | 'SHORT';
  thesis: string;
  risks: string;
}

export interface Modality {
  id: string;
  name: string;
  ticker: string;
  cognitiveLoad: number;      // x axis (biological)
  systemicAgency: number;     // y axis (biological)
  sensoryUtilization: number;  // z axis (biological)
  financialMetrics: FinancialMetrics;
}

export const modalitiesData: Modality[] = [
  {
    id: "books",
    name: "Books (Fiction)",
    ticker: "FIC",
    cognitiveLoad: 80,
    systemicAgency: 5,
    sensoryUtilization: 5,
    financialMetrics: {
      capex: 15,
      attentionYield: 35,
      retentionMoat: 75,
      tamRating: "Medium",
      recommendation: "UNDERPERFORM",
      thesis: "High friction acquisition channels and rising opportunity cost of leisure time make text-only fiction a low-yield attention sink.",
      risks: "Visual media substitution, decline in deep literacy rates."
    }
  },
  {
    id: "textbooks",
    name: "Textbooks / Non-Fiction",
    ticker: "NFX",
    cognitiveLoad: 90,
    systemicAgency: 5,
    sensoryUtilization: 5,
    financialMetrics: {
      capex: 30,
      attentionYield: 20,
      retentionMoat: 85,
      tamRating: "Small",
      recommendation: "SHORT",
      thesis: "Traditional structured text textbooks are highly vulnerable to disintermediation by interactive AI tutors and LLM synthesis engines.",
      risks: "Open-source educational content, rapid AI progress."
    }
  },
  {
    id: "comic_books",
    name: "Comic Books / Manga",
    ticker: "MNG",
    cognitiveLoad: 50,
    systemicAgency: 5,
    sensoryUtilization: 35,
    financialMetrics: {
      capex: 35,
      attentionYield: 60,
      retentionMoat: 80,
      tamRating: "Medium",
      recommendation: "BUY",
      thesis: "Highly translatable IP asset class. Low-effort consumption combined with intense fandom builds durable multimedia adaptation pipelines.",
      risks: "Scanlation piracy, artist attrition."
    }
  },
  {
    id: "podcasts",
    name: "Podcasts / Audiobooks",
    ticker: "AUD",
    cognitiveLoad: 30,
    systemicAgency: 5,
    sensoryUtilization: 20,
    financialMetrics: {
      capex: 15,
      attentionYield: 80,
      retentionMoat: 70,
      tamRating: "Large",
      recommendation: "BUY",
      thesis: "Enables multi-tasking, yielding high 'ambient attention share'. Uniquely captures audience time during low-attention transit and chore periods.",
      risks: "Over-saturation of supply, poor programmatic ad-tech monetization."
    }
  },
  {
    id: "movies",
    name: "Movies",
    ticker: "MVI",
    cognitiveLoad: 40,
    systemicAgency: 5,
    sensoryUtilization: 75,
    financialMetrics: {
      capex: 95,
      attentionYield: 55,
      retentionMoat: 35,
      tamRating: "Large",
      recommendation: "UNDERPERFORM",
      thesis: "High hit-dependency and ballooning CapEx budgets create an unfavorable risk-reward profile compared to recurring subscription models.",
      risks: "Post-theatrical window collapse, shorter window cycles."
    }
  },
  {
    id: "tv_series",
    name: "TV Series (Prestige)",
    ticker: "STG",
    cognitiveLoad: 45,
    systemicAgency: 5,
    sensoryUtilization: 70,
    financialMetrics: {
      capex: 80,
      attentionYield: 65,
      retentionMoat: 68,
      tamRating: "Large",
      recommendation: "HOLD",
      thesis: "Episodic narrative hooks drive stable platform subscriber retention, but content amortization cycles are getting unsustainably long.",
      risks: "Subscriber saturation, rising production talent costs."
    }
  },
  {
    id: "video_games_linear",
    name: "Video Games (Linear)",
    ticker: "VGL",
    cognitiveLoad: 60,
    systemicAgency: 65,
    sensoryUtilization: 80,
    financialMetrics: {
      capex: 70,
      attentionYield: 75,
      retentionMoat: 55,
      tamRating: "Medium",
      recommendation: "HOLD",
      thesis: "High retail prices offset lack of replayability, but limits LTV growth compared to recurring live-service products.",
      risks: "Development cycle inflation, consumer shift to free-to-play."
    }
  },
  {
    id: "video_games_open",
    name: "Video Games (Open World)",
    ticker: "VGO",
    cognitiveLoad: 65,
    systemicAgency: 85,
    sensoryUtilization: 85,
    financialMetrics: {
      capex: 90,
      attentionYield: 82,
      retentionMoat: 88,
      tamRating: "Large",
      recommendation: "BUY",
      thesis: "Acts as a virtual social sandbox. Multi-year monetization tailwinds via expansions and in-game economies justify high upfront development costs.",
      risks: "Extreme development cycle times, live-ops failure."
    }
  },
  {
    id: "video_games_grand",
    name: "Video Games (Grand Strategy)",
    ticker: "STR",
    cognitiveLoad: 95,
    systemicAgency: 95,
    sensoryUtilization: 30,
    financialMetrics: {
      capex: 45,
      attentionYield: 45,
      retentionMoat: 95,
      tamRating: "Small",
      recommendation: "STRONG BUY",
      thesis: "Infinite replayability drives near-zero churn. Niche scale is heavily offset by astronomical LTV and low visual asset CapEx requirements.",
      risks: "Steep user onboarding learning curves."
    }
  },
  {
    id: "vr_experiences",
    name: "VR Experiences",
    ticker: "VRX",
    cognitiveLoad: 70,
    systemicAgency: 75,
    sensoryUtilization: 95,
    financialMetrics: {
      capex: 80,
      attentionYield: 68,
      retentionMoat: 45,
      tamRating: "Small",
      recommendation: "HOLD",
      thesis: "Peak sensory presence is structurally locked by low consumer hardware adoption rates. High churn once initial novelty subsides.",
      risks: "Hardware friction, visual fatigue, fragmented app stores."
    }
  },
  {
    id: "social_media",
    name: "Social Media Feeds",
    ticker: "SOC",
    cognitiveLoad: 15,
    systemicAgency: 45,
    sensoryUtilization: 60,
    financialMetrics: {
      capex: 5,
      attentionYield: 92,
      retentionMoat: 94,
      tamRating: "Massive",
      recommendation: "BUY",
      thesis: "Zero cost of goods sold due to UGC structure. Hyper-personalized algorithmic dopamine loops yield massive ad impression scale.",
      risks: "Antitrust regulations, user cohort aging, platform fatigue."
    }
  },
  {
    id: "tabletop_rpgs",
    name: "Tabletop RPGs (D&D)",
    ticker: "TRP",
    cognitiveLoad: 85,
    systemicAgency: 100,
    sensoryUtilization: 30,
    financialMetrics: {
      capex: 10,
      attentionYield: 50,
      retentionMoat: 90,
      tamRating: "Small",
      recommendation: "BUY",
      thesis: "High user-generated agency creates intense product stickiness. Minimal physical CapEx; physical books act as high-margin collectables.",
      risks: "Licensing controversies, digital tool ecosystem competition."
    }
  },
  {
    id: "short_form_video",
    name: "Short-form Video (TikTok)",
    ticker: "SFV",
    cognitiveLoad: 10,
    systemicAgency: 20,
    sensoryUtilization: 70,
    financialMetrics: {
      capex: 5,
      attentionYield: 98,
      retentionMoat: 96,
      tamRating: "Massive",
      recommendation: "STRONG BUY",
      thesis: "Perfect adaptation to declining cognitive attention spans. Maximum visual-auditory capture for virtually zero user-side commitment.",
      risks: "Geopolitical ban risks, ad-market cyclicality."
    }
  },
  {
    id: "live_theater",
    name: "Live Theater",
    ticker: "THR",
    cognitiveLoad: 55,
    systemicAgency: 5,
    sensoryUtilization: 60,
    financialMetrics: {
      capex: 65,
      attentionYield: 40,
      retentionMoat: 60,
      tamRating: "Micro",
      recommendation: "UNDERPERFORM",
      thesis: "Physical-world capacity constraints prevent scaling. High operating leverage makes it highly cyclical and vulnerable to inflationary cost pressures.",
      risks: "Talent wage inflation, high real estate overheads."
    }
  },
  {
    id: "escape_rooms",
    name: "Escape Rooms",
    ticker: "ESC",
    cognitiveLoad: 85,
    systemicAgency: 85,
    sensoryUtilization: 80,
    financialMetrics: {
      capex: 55,
      attentionYield: 55,
      retentionMoat: 25,
      tamRating: "Micro",
      recommendation: "HOLD",
      thesis: "Excellent localized cash flow profile, but suffers from severe replayability issues once a room design is solved.",
      risks: "Short lifecycle of physical assets, high location rent."
    }
  },
  {
    id: "interactive_fiction",
    name: "Interactive Fiction",
    ticker: "INF",
    cognitiveLoad: 75,
    systemicAgency: 80,
    sensoryUtilization: 15,
    financialMetrics: {
      capex: 15,
      attentionYield: 70,
      retentionMoat: 65,
      tamRating: "Small",
      recommendation: "BUY",
      thesis: "Extremely cost-efficient to write/produce while providing high interactive agency. Strong monetization potential in Asian visual novel markets.",
      risks: "Highly saturated self-publishing space, niche Western appeal."
    }
  },
  {
    id: "ambient_music",
    name: "Ambient Music",
    ticker: "AMB",
    cognitiveLoad: 5,
    systemicAgency: 0,
    sensoryUtilization: 15,
    financialMetrics: {
      capex: 5,
      attentionYield: 90,
      retentionMoat: 55,
      tamRating: "Large",
      recommendation: "HOLD",
      thesis: "Low cognitive friction makes this a perfect utility asset. However, streaming royalty calculations penalize background listening formats.",
      risks: "AI content dilution, platform royalty pool restructuring."
    }
  },
  {
    id: "larp",
    name: "Live Action Role Play",
    ticker: "LRP",
    cognitiveLoad: 75,
    systemicAgency: 90,
    sensoryUtilization: 85,
    financialMetrics: {
      capex: 25,
      attentionYield: 40,
      retentionMoat: 92,
      tamRating: "Micro",
      recommendation: "HOLD",
      thesis: "Unrivaled participant immersion and retention, but highly unscalable. Functions more as a premium affinity club than a scalable media business.",
      risks: "Safety liability, logistical and coordinate overhead."
    }
  },
  {
    id: "theme_park_rides",
    name: "Theme Park Rides",
    ticker: "TPK",
    cognitiveLoad: 15,
    systemicAgency: 5,
    sensoryUtilization: 95,
    financialMetrics: {
      capex: 98,
      attentionYield: 58,
      retentionMoat: 78,
      tamRating: "Medium",
      recommendation: "HOLD",
      thesis: "Ultimate physical moat with massive capital barriers. Highly effective for IP cross-selling, but capital deployment payback periods exceed 15 years.",
      risks: "Macroeconomic tourist downturns, safety failures."
    }
  },
  {
    id: "gen_ai",
    name: "Gen AI Prompting",
    ticker: "GAI",
    cognitiveLoad: 70,
    systemicAgency: 90,
    sensoryUtilization: 20,
    financialMetrics: {
      capex: 75,
      attentionYield: 85,
      retentionMoat: 92,
      tamRating: "Massive",
      recommendation: "STRONG BUY",
      thesis: "High compute training cost offset by zero-marginal-cost inference and extreme user agency. The core platform shift of the current decade.",
      risks: "Compute cost inflation, model commoditization, litigation."
    }
  },
  {
    id: "television_theater",
    name: "Television Theater",
    ticker: "TTV",
    cognitiveLoad: 65,
    systemicAgency: 5,
    sensoryUtilization: 45,
    financialMetrics: {
      capex: 30,
      attentionYield: 35,
      retentionMoat: 55,
      tamRating: "Small",
      recommendation: "UNDERPERFORM",
      thesis: "Bridges high-intellect stage performance with passive TV broadcasting. Attracts an elite, loyal but unscalable cultural viewership.",
      risks: "Aging demographic demographics, high reliance on state subsidies or license fees."
    }
  },
  {
    id: "irl_streaming",
    name: "IRL Live Streaming",
    ticker: "IRL",
    cognitiveLoad: 25,
    systemicAgency: 50,
    sensoryUtilization: 50,
    financialMetrics: {
      capex: 10,
      attentionYield: 88,
      retentionMoat: 88,
      tamRating: "Large",
      recommendation: "BUY",
      thesis: "Leverages intense parasocial community dynamics. Delivers hours of secondary-screen user viewing for near-zero creator equipment costs.",
      risks: "Platform policy updates, creator exhaustion, lack of programmatic advertiser controls."
    }
  },
  {
    id: "interactive_learning",
    name: "Interactive E-Learning",
    ticker: "ELN",
    cognitiveLoad: 75,
    systemicAgency: 80,
    sensoryUtilization: 40,
    financialMetrics: {
      capex: 55,
      attentionYield: 60,
      retentionMoat: 85,
      tamRating: "Large",
      recommendation: "BUY",
      thesis: "Combines intellectual development with strong gamified habit loops. Subscriptions capture consistent, high-value consumer spend.",
      risks: "User churn when progress plateaus, emerging competition from conversational AI tutors."
    }
  },
  {
    id: "digital_art_nfts",
    name: "Digital Art & Web3 Collectibles",
    ticker: "NFT",
    cognitiveLoad: 40,
    systemicAgency: 35,
    sensoryUtilization: 25,
    financialMetrics: {
      capex: 20,
      attentionYield: 45,
      retentionMoat: 65,
      tamRating: "Small",
      recommendation: "SHORT",
      thesis: "Highly cyclical format heavily dependent on crypto-financial cycles rather than intrinsic attention utility. Value fades when speculative liquidity exits.",
      risks: "High regulatory pressure, security vulnerabilities, low retail audience stickiness."
    }
  },
  {
    id: "audio_assistants",
    name: "Smart Speaker Voice Apps",
    ticker: "IVA",
    cognitiveLoad: 50,
    systemicAgency: 70,
    sensoryUtilization: 20,
    financialMetrics: {
      capex: 25,
      attentionYield: 50,
      retentionMoat: 45,
      tamRating: "Medium",
      recommendation: "UNDERPERFORM",
      thesis: "Hands-free voice games and utilities display strong utility in domestic settings, but fail to monetize or scale due to lacks of screen real estate.",
      risks: "Low discovery on voice platforms, consumer usage plateau, high skill attrition."
    }
  }
];
