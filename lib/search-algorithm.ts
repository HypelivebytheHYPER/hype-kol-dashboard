import type { KOL, SearchCriteria, MatchScore } from "./types";

// Calculate match score between a KOL and search criteria
export function calculateMatchScore(kol: KOL, criteria: SearchCriteria): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  // Budget match (30% weight)
  if (criteria.budget && kol.avgGMV) {
    const estimatedCost = kol.avgGMV * 0.1; // Rough estimate
    if (estimatedCost <= criteria.budget) {
      score += 30;
      reasons.push("within budget");
    } else if (estimatedCost <= criteria.budget * 1.2) {
      score += 15;
      reasons.push("slightly over budget");
    }
  }

  // Audience alignment (25% weight)
  if (criteria.targetAudience) {
    // Check if KOL's audience matches target
    const hasAudienceMatch = kol.audience?.interests?.some((interest) =>
      interest.toLowerCase().includes(criteria.targetAudience!.toLowerCase())
    );
    if (hasAudienceMatch) {
      score += 25;
      reasons.push("audience match");
    }
  }

  // Performance history (20% weight)
  if (criteria.minGMV && kol.avgGMV && kol.avgGMV >= criteria.minGMV) {
    score += 20;
    reasons.push("strong GMV history");
  }

  // Content fit (15% weight)
  if (criteria.contentType && kol.contentTypes?.includes(criteria.contentType)) {
    score += 15;
    reasons.push("content type fit");
  }

  // Availability (10% weight)
  if (criteria.timeline && kol.availability?.status === "available") {
    const isAvailable = kol.availability?.status === "available";
    if (isAvailable) {
      score += 10;
      reasons.push("available");
    }
  }

  // Bonus for high engagement rate
  if (kol.engagementRate >= 5) {
    score += 5;
    reasons.push("high engagement");
  }

  // Bonus for high quality score
  if (kol.qualityScore >= 4) {
    score += 5;
    reasons.push("top quality");
  }

  // Cap score at 100
  score = Math.min(100, score);

  return {
    kol,
    score,
    reasons,
  };
}

// Rank KOLs by match score
export function rankKOLsByMatch(kols: KOL[], criteria: SearchCriteria): MatchScore[] {
  return kols.map((kol) => calculateMatchScore(kol, criteria)).sort((a, b) => b.score - a.score);
}

// Filter KOLs by criteria
export function filterKOLs(kols: KOL[], criteria: SearchCriteria): KOL[] {
  return kols.filter((kol) => {
    // Budget filter
    if (criteria.budget && kol.avgGMV) {
      const estimatedCost = kol.avgGMV * 0.1;
      if (estimatedCost > criteria.budget * 1.5) return false;
    }

    // Minimum GMV filter
    if (criteria.minGMV && kol.avgGMV && kol.avgGMV < criteria.minGMV) {
      return false;
    }

    // Content type filter
    if (criteria.contentType && !kol.contentTypes?.includes(criteria.contentType)) {
      return false;
    }

    // Availability filter
    if (criteria.timeline && kol.availability?.status === "booked") {
      return false;
    }

    return true;
  });
}

// Get recommendation reasons for display
export function getRecommendationReason(score: MatchScore): string {
  if (score.score >= 80) {
    return "Excellent match for your campaign";
  } else if (score.score >= 60) {
    return "Good match - consider for your campaign";
  } else if (score.score >= 40) {
    return "Moderate match - may need adjustments";
  }
  return "Below average match";
}

// Suggest similar KOLs based on a reference KOL
export function suggestSimilarKOLs(referenceKOL: KOL, allKOLs: KOL[], limit: number = 5): KOL[] {
  return allKOLs
    .filter((kol) => kol.id !== referenceKOL.id)
    .map((kol) => {
      let similarity = 0;

      // Same category
      const sharedCategories =
        kol.categories?.filter((cat) => referenceKOL.categories?.includes(cat)) || [];
      similarity += sharedCategories.length * 20;

      // Same tier
      if (kol.tier === referenceKOL.tier) {
        similarity += 15;
      }

      // Similar follower count (within 20%)
      const followerDiff = Math.abs(kol.followers - referenceKOL.followers);
      const followerRatio = followerDiff / referenceKOL.followers;
      if (followerRatio < 0.2) {
        similarity += 15;
      } else if (followerRatio < 0.5) {
        similarity += 10;
      }

      // Similar engagement rate
      const engagementDiff = Math.abs(kol.engagementRate - referenceKOL.engagementRate);
      if (engagementDiff < 1) {
        similarity += 10;
      } else if (engagementDiff < 3) {
        similarity += 5;
      }

      // Same location
      if (kol.location === referenceKOL.location) {
        similarity += 10;
      }

      return { kol, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((item) => item.kol);
}
