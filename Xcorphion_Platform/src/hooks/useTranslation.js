import { useRouter } from 'next/router';
import pt from '../translations/pt.json';
import en from '../translations/en.json';
import es from '../translations/es.json';

const dict = { pt, en, es };

export function useTranslation() {
  const router = useRouter();
  const locale = router?.locale || 'pt';
  const translations = dict[locale] || dict.pt;

  function t(key) {
    const parts = key.split('.');
    let val = translations;
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) return key;
    }
    return val ?? key;
  }

  return { t, locale };
}
