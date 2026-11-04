import { useAsync } from './useAsync.js';
import { fetchLatestWinners, fetchSeasonWinners } from '../services/winnersService.js';

export function useSeasonWinners(seasonId) {
  return useAsync(() => fetchSeasonWinners(seasonId), [seasonId]);
}

export function useLatestWinners() {
  return useAsync(fetchLatestWinners, []);
}
