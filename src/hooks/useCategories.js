import { useAsync } from './useAsync.js';
import { fetchCategories } from '../services/categoriesService.js';

export function useCategories() {
  return useAsync(fetchCategories, []);
}
