import { describe, it, expect } from 'vitest';
import { scenarioEngine } from '../src/demo/scenarioEngine';

describe('Demo Scenario Engine', () => {
  it('loads all hackathon scenarios properly', () => {
    const scenarios = scenarioEngine.getScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(5);

    const fallScenario = scenarios.find((s) => s.id === 'possibleSafetyIncident');
    expect(fallScenario).toBeDefined();
    expect(fallScenario?.targetSeverity).toBe('high');
  });

  it('can start and stop a scenario deterministically', async () => {
    const started = await scenarioEngine.runScenario('visitorArrives', 500);
    expect(started).toBe(true);

    const status = scenarioEngine.getStatus();
    expect(status.isRunning).toBe(true);

    scenarioEngine.stop();
    const stoppedStatus = scenarioEngine.getStatus();
    expect(stoppedStatus.isRunning).toBe(false);
  });
});
