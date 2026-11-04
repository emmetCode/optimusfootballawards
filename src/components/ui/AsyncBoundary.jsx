import Loader from './Loader.jsx';
import ErrorState from './ErrorState.jsx';

// Renders loading / error / empty states for a useAsync result, otherwise calls children(data).
export default function AsyncBoundary({ state, loading, isEmpty, empty, children }) {
  if (state.status === 'loading') return loading ?? <Loader />;
  if (state.status === 'error') return <ErrorState error={state.error} onRetry={state.reload} />;
  if (isEmpty && isEmpty(state.data)) return empty;
  return children(state.data);
}
