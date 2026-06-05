/**
 * ScoringEngine — Driving score calculation
 *
 * Scoring rules:
 * - Start at 100 points
 * - Deductions per event type (defined in EVENT_META)
 * - Minimum score: 0
 * - Safety ratings: Excellent (90-100), Good (75-89), Fair (50-74), Poor (0-49)
 */
import type { DetectedEvent, SafetyRating, ScoreResult } from '@/types';

import { theme } from '@/theme/colors';

class ScoringEngine {
  private static readonly MAX_SCORE = 100;
  private static readonly MIN_SCORE = 0;

  /**
   * Calculate the driving score from a list of detected events.
   */
  calculateScore(events: DetectedEvent[]): ScoreResult {
    let totalDeductions = 0;

    for (const event of events) {
      totalDeductions += event.deduction;
    }

    const score = Math.max(
      ScoringEngine.MIN_SCORE,
      ScoringEngine.MAX_SCORE - totalDeductions,
    );

    return {
      score,
      rating: this.getRating(score),
      totalDeductions,
    };
  }

  /**
   * Calculate score incrementally (for real-time updates).
   */
  calculateIncrementalScore(currentScore: number, newEvent: DetectedEvent): ScoreResult {
    const score = Math.max(
      ScoringEngine.MIN_SCORE,
      currentScore - newEvent.deduction,
    );

    return {
      score,
      rating: this.getRating(score),
      totalDeductions: ScoringEngine.MAX_SCORE - score,
    };
  }

  /**
   * Get safety rating from score.
   */
  getRating(score: number): SafetyRating {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }

  /**
   * Get rating color from the theme palette.
   */
  getRatingColor(rating: SafetyRating): string {
    switch (rating) {
      case 'Excellent':
        return theme.excellent;
      case 'Good':
        return theme.good;
      case 'Fair':
        return theme.fair;
      case 'Poor':
        return theme.poor;
    }
  }

  /**
   * Get motivational message based on rating.
   */
  getMotivationalMessage(rating: SafetyRating): string {
    switch (rating) {
      case 'Excellent':
        return 'Outstanding driving! Keep it up! 🌟';
      case 'Good':
        return 'Keep driving safe for a better tomorrow. 👍';
      case 'Fair':
        return 'Room for improvement. Stay focused! 🎯';
      case 'Poor':
        return 'Drive with caution. Safety first! ⚠️';
    }
  }
}

export const scoringEngine = new ScoringEngine();
