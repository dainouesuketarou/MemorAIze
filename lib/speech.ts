import { franc } from 'franc-min';

/** 多言語マップ */
const LANG_MAP: Record<string, string> = {
  jpn: 'ja',
  eng: 'en',
  fra: 'fr',
  spa: 'es',
  deu: 'de',
  ita: 'it',
  cmn: 'zh',
  zho: 'zh',
  kor: 'ko',
  rus: 'ru',
  por: 'pt',
  hin: 'hi',
  ara: 'ar',
  swe: 'sv',
  nld: 'nl',
  tur: 'tr',
  vie: 'vi',
  pol: 'pl',
  fin: 'fi',
  dan: 'da',
  nor: 'no',
  gle: 'ga',
  ell: 'el',
  hun: 'hu',
  ces: 'cs',
  ron: 'ro',
  ukr: 'uk',
  tha: 'th',
  ind: 'id',
  slk: 'sk',
  srp: 'sr',
  heb: 'he',
};

/** 文字列から言語コードを返す */
export const detectLang = (text: string): string => {
  console.log('[TTS] detectLang input:', text);
  if (/^[\u3040-\u30FF\u4E00-\u9FFF]+$/.test(text)) return 'ja';
  if (/^[A-Za-z\s',\.]+$/.test(text)) return 'en';
  const code3 = franc(text, { minLength: 1 });
  const lang = LANG_MAP[code3] || 'en';
  console.log('[TTS] franc code:', code3, '→', lang);
  return lang;
};

/** 言語に合う voice を選ぶ */
const pickVoice = (lang: string): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  console.log(
    '[TTS] available voices langs:',
    voices.map((v) => v.lang),
  );
  const v = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  console.log('[TTS] pickVoice result:', v?.name, v?.lang);
  return v || null;
};

/** テキストを音声で読み上げ */
export const speak = (text: string) => {
  console.log('[TTS] speak():', text);
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[TTS] not supported');
    return;
  }

  const lang = detectLang(text);
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.volume = 1;
  utter.rate = 1;
  utter.pitch = 1;

  utter.onstart = () => console.log('[TTS] onstart:', text);
  utter.onend = () => console.log('[TTS] onend:', text);
  utter.onerror = (e) => console.error('[TTS] onerror:', e);

  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;

  // voices がまだロードされていなければ待つ
  if (!speechSynthesis.getVoices().length) {
    const onVoicesChanged = () => {
      console.log('[TTS] voiceschanged');
      speechSynthesis.speak(utter);
      speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
    };
    speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
  } else {
    speechSynthesis.speak(utter);
  }
};

/** カードの前 or 裏を読み上げ */
export const speakFrontOrBack = (
  card: { front: string; back: string },
  showAnswer: boolean,
  reverse?: boolean,
) => {
  const text = showAnswer
    ? reverse
      ? card.front
      : card.back
    : reverse
    ? card.back
    : card.front;
  console.log('[TTS] speakFrontOrBack →', text);
  speak(text);
};
