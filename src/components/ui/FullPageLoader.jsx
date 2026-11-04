import Loader from './Loader.jsx';

export default function FullPageLoader({ label = 'Loading' }) {
  return (
    <div className="fullpage">
      <Loader label={label} />
    </div>
  );
}
