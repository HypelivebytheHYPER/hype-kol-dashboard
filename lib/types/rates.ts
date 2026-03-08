export interface TierRate {
  tier: string;
  ourRate: number;
  competitorRates: Record<string, number>;
  marketAverage: number;
}

export interface CompetitorRates {
  name: string;
  rates: Record<string, number>;
}

export interface MarginCalculation {
  clientBudget: number;
  selectedTier: string;
  contentMix: ContentMixItem[];
  estimatedReach: { min: number; max: number };
  estimatedGMV: { min: number; max: number };
  ourCost: number;
  platformFee: number;
  margin: number;
  marginPercentage: number;
  totalInvestment: number;
}

export interface ContentMixItem {
  type: string;
  quantity: number;
  unitPrice: number;
}

export interface PricingIntel {
  ourRates: TierRate[];
  competitors: CompetitorRates[];
  lastUpdated: string;
}

export interface RateCardDisplay {
  kolName: string;
  kolId: string;
  year: number;
  services: Array<{
    name: string;
    clientRate: number;
    ourCost: number;
    margin: number;
    marginPercentage: number;
  }>;
}
