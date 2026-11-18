// AI 讀得懂類規則：指代不明的片語、對 AI 說話的句子。只看程式碼以外的文字。
import { stripPlaceholders } from '../data.js';
import { proseLines } from './util.js';

const VAGUE_REFERENCES = [
  /如上所述|如上所示|如上圖|如上表|如前所述|如前面所說|前面提到的?|照之前那樣|承上/g,
  /同上(?=[\s，。、；）)|]|$)/g,
  /\bas (?:mentioned|described|shown|stated) (?:above|earlier|before|previously)\b/gi,
  /\b(?:see|same as) above\b/gi,
  /\bas before\b/gi,
];

const AI_DIRECTED = [
  /你是一(?:個|位|名)[^，。,.\n]{0,12}?(?:AI|助理|助手|工程師|開發者|專家|程式設計師|顧問|設計師|寫手)/g,
  /(?:^\s*(?:[-*+>]\s+|\d+[.)]\s+)?|[.!?。！？]\s*)You are (?:an? )?(?:expert|senior|helpful|professional|experienced|world-class)\b[^.!?。]*/gi,
  /(?:^\s*(?:[-*+>]\s+|\d+[.)]\s+)?|[.!?。！？]\s*)You are an? (?:AI|assistant|coding assistant|language model)\b[^.!?。]*/gi,
  /\bAs an AI\b[^.!?。]*/gi,
  /\bignore (?:all )?(?:the )?previous instructions\b/gi,
  /忽略(?:之前|先前|以上)(?:所有)?的?(?:指示|指令)/g,
];

function scan(ctx, patterns) {
  const out = [];
  for (const line of proseLines(ctx.md)) {
    const text = stripPlaceholders(line.prose);
    for (const pattern of patterns) {
      for (const m of text.matchAll(pattern)) {
        const phrase = m[0].replace(/^[^A-Za-z\p{Script=Han}]+/u, '').trim();
        if (!phrase) continue;
        const column = m.index + m[0].indexOf(phrase) + 1;
        out.push({ messageKey: 'found', params: { text: phrase.length > 40 ? `${phrase.slice(0, 40)}…` : phrase }, line: line.line, column });
      }
    }
  }
  return out;
}

export const checks = {
  AIR001: (ctx) => scan(ctx, VAGUE_REFERENCES),
  AIR005: (ctx) => scan(ctx, AI_DIRECTED),
};
