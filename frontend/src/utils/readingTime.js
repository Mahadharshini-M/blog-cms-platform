const WORDS_PER_MINUTE = 200;

export function readingTime(markdown = "") {
  const words = markdown.replace(/[#*_`>[\]()-]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}
