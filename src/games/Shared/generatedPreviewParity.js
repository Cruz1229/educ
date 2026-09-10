const escapeGeneratedHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const GENERATED_PREVIEW_HEADER_STYLES = `
.logic-path-title-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}
.logic-path-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 0 .25rem;
  color: #1f2937;
  font-family: "Merriweather", Georgia, serif;
  font-size: clamp(1.85rem, 4vh, 2.55rem);
  font-weight: 700;
  text-align: center;
}
.logic-path-title > span {
  display: inline-block;
  position: relative;
  animation: generatedPreviewWave 1.8s infinite;
}
.logic-path-floating-icons { display: none; }
@keyframes generatedPreviewWave {
  0%, 40%, 100% { transform: translateY(0); }
  20% { transform: translateY(-20px); }
}
@media (prefers-reduced-motion: reduce) {
  .logic-path-title > span { animation: none; }
}
`;

export function buildGeneratedPreviewHeader({
  title,
  symbols = [],
}) {
  const titleMarkup = [...String(title || "")]
    .map(
      (character, index) =>
        `<span style="animation-delay:${index * 0.1}s">${
          character === " " ? "&nbsp;" : escapeGeneratedHtml(character)
        }</span>`,
    )
    .join("");
  const symbolMarkup = symbols
    .slice(0, 4)
    .map(
      (symbol, index) =>
        `<span class="logic-path-icon-${index + 1}">${escapeGeneratedHtml(symbol)}</span>`,
    )
    .join("");
  // Share the game's visual title, never the generator's setup navigation.
  return `<div class="logic-path-title-container"><h1 class="logic-path-title">${titleMarkup}</h1><div class="logic-path-floating-icons" aria-hidden="true">${symbolMarkup}</div></div>`;
}
