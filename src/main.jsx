import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
import App from './App.jsx';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/controls.css';
import './styles/states.css';
import './styles/hero.css';
import './styles/cards.css';
import './styles/pages.css';
import './styles/public.css';

// Windows browsers cannot draw flag emoji; this loads a small self-hosted flag font only when needed.
polyfillCountryFlagEmojis('Twemoji Country Flags', '/fonts/TwemojiCountryFlags.woff2');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
