import { describe, it, expect } from 'vitest';
import { AIAnalysisResultSchema } from '../src/types';
import { bedrockService } from '../src/ai/bedrockService';

describe('AI Validation and Conservative Reasoning', () => {
  it('validates compliant AI analysis schema', () => {
    const validData = {
      summary: 'Possible safety incident detected near front entrance.',
      severity: 'high',
      confidence: 0.94,
      reasoning: 'Abrupt downward deceleration followed by no movement.',
      recommendedAction: 'Check on person immediately.',
      requiresAttention: true,
    };

    const parsed = AIAnalysisResultSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid severity level in schema', () => {
    const invalidData = {
      summary: 'Test',
      severity: 'catastrophic', // invalid enum
      confidence: 0.5,
      reasoning: 'Reason',
      recommendedAction: 'Action',
      requiresAttention: true,
    };

    const parsed = AIAnalysisResultSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('generates conservative mock analysis for possible fall without medical diagnosis', () => {
    const fallEvent = {
      id: 'evt_test_fall',
      timestamp: new Date().toISOString(),
      source: 'demo' as const,
      deviceId: 'ring-doorbell-01',
      location: 'Front Entrance',
      eventType: 'possible_fall' as const,
      confidence: 0.94,
    };

    const analysis = bedrockService.generateConservativeMockAnalysis(fallEvent, []);

    expect(analysis.severity).toBe('high');
    expect(analysis.requiresAttention).toBe(true);
    expect(analysis.summary.toLowerCase()).toContain('possible');
    // Ensure no medical diagnostic claims
    expect(analysis.summary.toLowerCase()).not.toContain('fracture');
    expect(analysis.summary.toLowerCase()).not.toContain('concussion');
  });
});
