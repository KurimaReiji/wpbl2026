import { describe, it, expect } from 'vitest';
import { Teams, findTeam, getTeams } from '../wpbl2026-teams.js';

describe('WPBL Team Profile Tests', () => {

  it('should apply ops correctly', () => {
    const bos = findTeam('BOS');
    const la = findTeam('LA');
    const ny = findTeam('New York');
    const sf = findTeam('Firebells');
    expect(bos.name).toBe('Boston Hunters');
    expect(bos.manager).toBe('Jemile Weeks');
    expect(la.teamName).toBe('Queens');
    expect(ny.teamName).toBe('Heights');
    expect(sf.franchiseName).toBe('San Francisco');
  });

  it('should retain the previous manager for effective date 2026-08-01', () => {
    const teamsAt0801 = getTeams('2026-08-01');
    const bos = findTeam('BOS', teamsAt0801);
    expect(bos.name).toBe('Boston Hunters');
    expect(bos.manager).toBe('Keith Foulke');
  });

  it('should update to the new manager for effective date 2026-08-10', () => {
    const teamsAt0810 = getTeams('2026-08-10');
    const bos = findTeam('BOS', teamsAt0810);
    expect(bos.manager).toBe('Jemile Weeks');
  });

});