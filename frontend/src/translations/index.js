// frontend/src/translations/index.js
// Centralized translation management with all language files

import en from './en';
import hi from './hi';
import pa from './pa';
import ta from './ta';
import bn from './bn';

// Create the translations object
const translations = {
  en: en || {},
  hi: hi || {},
  pa: pa || {},
  ta: ta || {},
  bn: bn || {}
};

// Make sure each language has at least basic translations
// If any language file is empty, provide fallback
if (Object.keys(translations.en).length === 0) {
  translations.en = {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'nav.home': 'Home',
    // Add more basic translations as needed
  };
}

export default translations;