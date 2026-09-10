import { buildGeneratedHtml as buildAlgorithmHtml } from "../DesarrolloAlgoritmos/Algoritmos";
import { buildGeneratedHtml as buildRobotHtml } from "../Robot/Robot";
import { buildGeneratedPreviewHeader } from "./generatedPreviewParity";
import { openGeneratedHtml } from "./generatedHtmlTestUtils";

describe("downloaded HTML preview parity", () => {
  test("shares the animated title without generator navigation", () => {
    const header = buildGeneratedPreviewHeader({
      title: "LogicPath",
      symbols: ["A", "D", "I", "B"],
      arEnabled: true,
    });

    expect(header).toContain('class="logic-path-title"');
    expect(header).toContain('animation-delay:0s">L</span><span style="animation-delay:0.1s">o');
    expect(header).not.toContain("Vista Previa");
    expect(header).not.toContain("Resumen");
    expect(header).not.toContain("logic-path-progress");
  });

  test("Robot Walking preserves its start screen and full-width game layout", () => {
    const html = buildRobotHtml({
      fullConfig: { nombreApp: "Robot Walking", descripcion: "Prueba" },
      level: "basico",
      exercises: [],
      arEnabled: true,
      selectedStages: { Inicio: true },
      arConfig: { Inicio: { text: "Comienza" } },
      robotAssets: {},
    });

    expect(html).toContain('data-preview-parity="robot-walking"');
    expect(html).toContain('class="robot-game-panel"');
    expect(html).toContain('id="start-screen" class="launch-overlay"');
    expect(html).not.toContain("logic-path-progress");
    expect(html).toContain(".robot-game-panel {\n  width: 100%;\n  max-width: none;");
  });

  test("Algorithm exports the same three-column preview surface", () => {
    const html = buildAlgorithmHtml({
      config: { level: "basico", challengeIds: [] },
      gameDetails: { gameName: "Algorithm" },
      selectedPlatforms: ["web"],
      selectedChallenges: [],
      arEnabled: true,
      arSelectedStages: { Inicio: true },
      arConfig: { Inicio: { text: "Comienza" } },
    });

    expect(html).toContain('data-preview-parity="algorithm"');
    expect(html).toContain('class="alg-panel alg-game-panel hidden"');
    expect(html).toContain("alg-guide-column");
    expect(html).toContain("alg-center-column");
    expect(html).toContain("alg-progress-column");
    expect(html).toContain('id="start-screen" class="overlay"');
    expect(html).not.toContain("window.requestAnimationFrame(start)");
    expect(html).not.toContain('class="logic-path-progress-bar"');
    expect(html).toContain(".alg-game-panel {\n  width: 100%;\n  max-width: none;");
  });

  test.each([false, true])("Robot Walking starts only on click (RA: %s)", async (arEnabled) => {
    const page = await openGeneratedHtml(buildRobotHtml({
      fullConfig: { nombreApp: "Robot Walking", autor: "EducSteam", descripcion: "Descripción de prueba", plataformas: ["web"] },
      level: "basico", exercises: [], robotAssets: {},
      arEnabled, selectedStages: { Inicio: true }, arConfig: { Inicio: { text: "Contenido inicial" } },
    }));
    try {
      const { document: doc, advanceTime } = page;
      advanceTime(6000);
      expect(doc.getElementById("start-screen").classList.contains("hidden")).toBe(false);
      expect(doc.getElementById("game-screen").classList.contains("hidden")).toBe(true);
      expect(doc.querySelector(".modal")).toBeNull();
      doc.getElementById("show-info-btn").click();
      expect(doc.getElementById("info-overlay").getAttribute("aria-hidden")).toBe("false");
      expect(doc.getElementById("info-author").textContent).toBe("EducSteam");
      expect(doc.getElementById("info-description").textContent).toBe("Descripción de prueba");
      doc.getElementById("close-info-btn").click();
      expect(doc.getElementById("info-overlay").getAttribute("aria-hidden")).toBe("true");
      doc.getElementById("start-game-btn").click();
      expect(doc.getElementById("countdown-screen").classList.contains("hidden")).toBe(false);
      advanceTime(5016);
      expect(doc.getElementById("game-screen").classList.contains("hidden")).toBe(false);
      expect(doc.getElementById("start-screen").classList.contains("hidden")).toBe(true);
      expect(doc.querySelector(".robot-game-layout")).not.toBeNull();
      expect(!!doc.querySelector(".modal")).toBe(arEnabled);
      expect(doc.querySelector('[class*="logic-path-progress"]')).toBeNull();
    } finally { page.close(); }
  });

  test.each([false, true])("Algorithm starts only on click (RA: %s)", async (arEnabled) => {
    const page = await openGeneratedHtml(buildAlgorithmHtml({
      config: { level: "basico", challengeIds: [] },
      gameDetails: { gameName: "Algorithm", authorName: "EducSteam", description: "Descripción de prueba" },
      selectedPlatforms: ["web"], selectedChallenges: [],
      arEnabled, arSelectedStages: { Inicio: true }, arConfig: { Inicio: { text: "Contenido inicial" } },
    }));
    try {
      const { document: doc, advanceTime } = page;
      advanceTime(6000);
      expect(doc.getElementById("start-screen").classList.contains("hidden")).toBe(false);
      expect(doc.getElementById("game").classList.contains("hidden")).toBe(true);
      expect(doc.querySelector(".modal")).toBeNull();
      doc.getElementById("show-info-btn").click();
      expect(doc.getElementById("info-overlay").getAttribute("aria-hidden")).toBe("false");
      expect(doc.getElementById("info-author-value").textContent).toBe("EducSteam");
      expect(doc.getElementById("info-description-value").textContent).toBe("Descripción de prueba");
      doc.getElementById("close-info-btn").click();
      expect(doc.getElementById("info-overlay").getAttribute("aria-hidden")).toBe("true");
      doc.getElementById("start-btn").click();
      expect(doc.getElementById("countdown-screen").classList.contains("hidden")).toBe(false);
      advanceTime(5016);
      expect(doc.getElementById("game").classList.contains("hidden")).toBe(false);
      expect(doc.getElementById("start-screen").classList.contains("hidden")).toBe(true);
      expect(doc.querySelector(".alg-game-layout")).not.toBeNull();
      expect(!!doc.querySelector(".modal")).toBe(arEnabled);
      expect(doc.querySelector('[class*="logic-path-progress"]')).toBeNull();
    } finally { page.close(); }
  });
});
