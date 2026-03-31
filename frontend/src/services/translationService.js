// Purpose: Provides API-based translation helpers with dictionary fetch and per-text translation.
import api from './api';

class TranslationService {
  async getDictionary(lang = 'en') {
    const response = await api.get(`/translate/dictionary?lang=${lang}`);
    return response.data?.data?.dictionary || {};
  }

  async translate(text, lang = 'en') {
    const response = await api.post('/translate/text', { text, lang });
    return response.data?.data?.translatedText || text;
  }
}

export default new TranslationService();
