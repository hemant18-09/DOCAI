export function normalize(text) {
  if (!text || typeof text !== "string") return "";

  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/(chest)(pain)/g, "chest pain") // 🔥 KEY LINE
    .replace(/(heart)(attack)/g, "heart attack")
    .trim();
}
