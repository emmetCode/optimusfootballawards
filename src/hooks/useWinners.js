import { useAsync } from './useAsync.js';
import { fetchSeasonWinners } from '../services/winnersService.js';

export function useSeasonWinners(seasonId) {
  return useAsync(() => fetchSeasonWinners(seasonId), [seasonId]);
}
