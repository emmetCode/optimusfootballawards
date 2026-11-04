import { useAsync } from './useAsync.js';
import { fetchSeasonOptions } from '../services/seasonsService.js';

export function useSeasonOptions() {
  return useAsync(fetchSeasonOptions, []);
}
