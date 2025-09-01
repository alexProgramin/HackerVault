"use client";

import { useLanguage } from '@/contexts/language-context';
import * as translations from '@/lib/i18n';

type TranslationKey = keyof typeof translations.en;
type TranslationVariables = Record<string, string | number>;

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey, variables?: TranslationVariables): string => {
    let translation = translations[language][key] || translations['en'][key];

    if (variables) {
      Object.keys(variables).forEach(varKey => {
        const regex = new RegExp(`{{${varKey}}}`, 'g');
        translation = translation.replace(regex, String(variables[varKey]));
      });
    }

    return translation;
  };

  return { t, language };
};
