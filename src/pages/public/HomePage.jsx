import Hero from '../../components/awards/Hero.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function HomePage() {
  usePageTitle('');

  return <Hero />;
}
