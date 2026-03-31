// Purpose: Provides a small translation catalog for API-based language lookups with English fallback.
const catalog = {
  en: {
    'nav.home': 'Home',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.apply': 'Apply',
    'common.view': 'View'
  },
  hi: {
    'nav.home': 'होम',
    'nav.messages': 'मैसेज',
    'nav.profile': 'प्रोफाइल',
    'nav.dashboard': 'डैशबोर्ड',
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.logout': 'लॉग आउट',
    'common.search': 'खोजें',
    'common.loading': 'लोड हो रहा है...'
  },
  pa: {
    'nav.home': 'ਹੋਮ',
    'nav.messages': 'ਸੁਨੇਹੇ',
    'nav.profile': 'ਪ੍ਰੋਫਾਈਲ',
    'auth.login': 'ਲੋਗਇਨ',
    'auth.register': 'ਰਜਿਸਟਰ'
  },
  ta: {
    'nav.home': 'முகப்பு',
    'nav.messages': 'செய்திகள்',
    'nav.profile': 'சுயவிவரம்',
    'auth.login': 'உள்நுழை',
    'auth.register': 'பதிவு செய்'
  },
  bn: {
    'nav.home': 'হোম',
    'nav.messages': 'বার্তা',
    'nav.profile': 'প্রোফাইল',
    'auth.login': 'লগইন',
    'auth.register': 'রেজিস্টার'
  }
};

const translate = (text, lang = 'en') => {
  if (!text) return '';
  const langMap = catalog[lang] || {};
  const englishMap = catalog.en || {};
  return langMap[text] || englishMap[text] || text;
};

module.exports = {
  catalog,
  translate
};
