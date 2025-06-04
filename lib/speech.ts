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
  if (/^[\u3040-\u30FF\u4E00-\u9FFF]+$/.test(text)) return 'ja';
  if (/^[A-Za-z\s',\.]+$/.test(text)) return 'en';
  const code3 = franc(text, { minLength: 1 });
  const lang = LANG_MAP[code3] || 'en';
  return lang;
};

/** 言語に合う voice を選ぶ */
const pickVoice = (lang: string): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  const v = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  return v || null;
};

// 音声合成の状態管理
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeaking = false;

/** 音声を停止 */
export const stopSpeaking = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  if (currentUtterance) {
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
  }
  speechSynthesis.cancel();
  currentUtterance = null;
  isSpeaking = false;
};

/** テキストを音声で読み上げ */
export const speak = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // 既存の音声を停止
  stopSpeaking();

  const lang = detectLang(text);
  const utter = new SpeechSynthesisUtterance(text);
  currentUtterance = utter;
  utter.lang = lang;
  utter.volume = 1;
  utter.rate = 0.9; // 少し遅めに
  utter.pitch = 1;

  utter.onstart = () => {
    isSpeaking = true;
    console.log('[TTS] onstart:', text);
  };

  utter.onend = () => {
    isSpeaking = false;
    currentUtterance = null;
    console.log('[TTS] onend:', text);
  };

  utter.onerror = (e) => {
    isSpeaking = false;
    currentUtterance = null;
    console.error('[TTS] onerror:', e);

    // canceledエラーの場合は再試行しない
    if (e.error === 'canceled') {
      return;
    }

    // その他のエラーの場合、少し待ってから再試行
    if (e.error === 'interrupted') {
      setTimeout(() => {
        if (!isSpeaking) {
          speak(text);
        }
      }, 100);
    }
  };

  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;

  // voices がまだロードされていなければ待つ
  if (!speechSynthesis.getVoices().length) {
    const onVoicesChanged = () => {
      if (!isSpeaking) {
        speechSynthesis.speak(utter);
      }
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
  speak(text);
};
