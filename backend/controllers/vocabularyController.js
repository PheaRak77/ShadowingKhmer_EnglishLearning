import { VocabularyModel } from '../models/vocabularyModel.js';
import { enrichWordWithGemini } from '../services/geminiService.js';

export const VocabularyController = {
  // GET /api/vocabulary
  async getUserVocabulary(req, res) {
    try {
      const vocabulary = await VocabularyModel.findAllByUserId(req.user.id);
      return res.json({ vocabulary });
    } catch (err) {
      console.error('Get vocabulary error:', err);
      return res.status(500).json({ error: 'Failed to fetch saved vocabulary.' });
    }
  },

  // POST /api/vocabulary/save
  async saveWord(req, res) {
    try {
      let {
        lesson_id,
        word,
        ipa,
        part_of_speech,
        khmer_meaning,
        example_sentence,
        context_sentence,
      } = req.body;

      if (!word || !word.trim()) {
        return res.status(400).json({ error: 'Word is required.' });
      }

      const cleanedWord = word.replace(/[^a-zA-Z0-9'-]/g, '').trim().toLowerCase();
      if (!cleanedWord) {
        return res.status(400).json({ error: 'Please select a valid English word.' });
      }

      if (!khmer_meaning || !ipa) {
        try {
          const parsed = await enrichWordWithGemini(
            cleanedWord,
            context_sentence || example_sentence
          );
          if (parsed) {
            ipa = ipa || parsed.ipa || '';
            part_of_speech = part_of_speech || parsed.part_of_speech || 'word';
            khmer_meaning = khmer_meaning || parsed.khmer_meaning || 'ពាក្យវាក្យសព្ទ';
            example_sentence =
              example_sentence || context_sentence || parsed.example_sentence || '';
          }
        } catch (aiErr) {
          console.warn('Gemini word enrichment fallback:', aiErr.message);
        }
      }

      const savedWord = await VocabularyModel.create({
        userId: req.user.id,
        lessonId: lesson_id || null,
        word: cleanedWord,
        ipa,
        partOfSpeech: part_of_speech,
        khmerMeaning: khmer_meaning,
        exampleSentence: example_sentence || context_sentence,
      });

      return res.status(201).json({ word: savedWord });
    } catch (err) {
      console.error('Save vocabulary error:', err);
      return res.status(500).json({ error: 'Failed to save word to vocabulary.' });
    }
  },
};

