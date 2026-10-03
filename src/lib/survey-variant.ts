import type { SurveyQuestion } from "./learning-data";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shiftNumbers(text: string, delta: number): string {
  return text.replace(/\d+/g, (match) => String(Math.max(0, Number(match) + delta)));
}

/**
 * Tạo câu hỏi tương tự (cùng dạng, cùng kỹ năng) với giá trị số khác.
 * - Dạng "a + b = ?", "a − b = ?", "a + ☐ = c", "a − ☐ = c", "☐ ± b = c":
 *   đổi số rồi TÍNH LẠI kết quả nên đáp án luôn đúng toán.
 * - Các câu khác: giữ nguyên nội dung, chỉ đảo thứ tự lựa chọn (an toàn).
 */
export function makeVariant(question: SurveyQuestion): SurveyQuestion {
  const prompt = question.prompt.trim();

  /* a + b = ?  hoặc  a − b = ? */
  const binary = prompt.match(/^(\d+)\s*([+\-])\s*(\d+)\s*=\s*\?\s*$/);
  if (binary) {
    const a = Number(binary[1]);
    const op = binary[2];
    const b = Number(binary[3]);
    const a2 = a + randInt(1, 4);
    const result = op === "+" ? a2 + b : a2 - b;
    if (result >= 0) {
      const oldResult = op === "+" ? a + b : a - b;
      return {
        ...question,
        prompt: `${a2} ${op} ${b} = ?`,
        correctAnswer: String(result),
        options: question.options.map((option) => shiftNumbers(option, result - oldResult)),
        explanation: `${a2} ${op === "+" ? "cộng" : "trừ"} ${b} bằng ${result}.`,
      };
    }
  }

  /* a + ☐ = c ; a − ☐ = c ; ☐ + b = c ; ☐ − b = c */
  const missing = prompt.match(/^(\d+|☐)\s*([+\-])\s*(\d+|☐)\s*=\s*(\d+)\s*$/);
  if (missing) {
    const left = missing[1];
    const op = missing[2];
    const right = missing[3];
    const c = Number(missing[4]);
    const known = left === "☐" ? Number(right) : Number(left);
    const answer = left === "☐"
      ? (op === "+" ? c - known : c + known)
      : (op === "+" ? c - known : known - c);
    if (answer >= 0 && (left === "☐" || right === "☐")) {
      const deltaKnown = randInt(1, 4);
      const deltaC = randInt(0, 4);
      const known2 = known + deltaKnown;
      const c2 = c + deltaC;
      const answer2 = left === "☐"
        ? (op === "+" ? c2 - known2 : c2 + known2)
        : (op === "+" ? c2 - known2 : known2 - c2);
      if (answer2 >= 0) {
        const newPrompt = left === "☐"
          ? `☐ ${op} ${known2} = ${c2}`
          : `${known2} ${op} ☐ = ${c2}`;
        return {
          ...question,
          prompt: newPrompt,
          correctAnswer: String(answer2),
          options: question.options.map((option) => shiftNumbers(option, answer2 - answer)),
          explanation: `${c2} ${op === "+" ? "trừ" : "cộng"} ${known2} bằng ${answer2}.`,
        };
      }
    }
  }

  /* mặc định an toàn: chỉ đảo thứ tự lựa chọn */
  return { ...question, options: shuffle(question.options) };
}
