// Purpose: Exposes mock translation API endpoints for dynamic UI translation.
const express = require('express');
const router = express.Router();
const { catalog, translate } = require('../utils/translationCatalog');

router.get('/dictionary', (req, res) => {
  const lang = req.query.lang || 'en';
  res.json({
    success: true,
    data: {
      lang,
      dictionary: {
        ...(catalog.en || {}),
        ...(catalog[lang] || {})
      }
    }
  });
});

router.post('/text', (req, res) => {
  const { text = '', lang = 'en' } = req.body || {};
  res.json({
    success: true,
    data: {
      text,
      lang,
      translatedText: translate(text, lang)
    }
  });
});

module.exports = router;
