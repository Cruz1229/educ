import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import JSZip from "jszip";
import { openGeneratedHtml } from "../Shared/generatedHtmlTestUtils";
import {
  LOGIC_PATH_NATIVE_TEMPLATE_URLS,
  SummaryPanel,
} from "./Laberinto";

function readBlobAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe("LogicPath HTML export", () => {
  const originalJSZip = window.JSZip;
  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;
  const originalAnchorClick = HTMLAnchorElement.prototype.click;

  beforeEach(() => {
    window.JSZip = JSZip;
    jest.spyOn(Math, "random").mockReturnValue(0.99);
    window.URL.createObjectURL = jest.fn(() => "blob:logicpath-export");
    window.URL.revokeObjectURL = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  afterEach(() => {
    window.JSZip = originalJSZip;
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    HTMLAnchorElement.prototype.click = originalAnchorClick;
    jest.restoreAllMocks();
  });

  test("genera un juego con RA modal, arrastre activo y regreso al inicio", async () => {
    render(
      <SummaryPanel
        config={{ level: "basico", exerciseCount: 3 }}
        arEnabled
        arSelectedStages={{ Inicio: true, Acierto: true, Final: true }}
        arConfig={{
          Inicio: { text: "Comienza" },
          Acierto: { text: "Correcto" },
          Final: { text: "Terminaste" },
        }}
        onBack={jest.fn()}
        state={{
          selectedPlatforms: ["web"],
          gameDetails: {
            gameName: "LogicPath prueba",
            authorName: "EducSteam",
            version: "1.0.0",
            date: "2026-08-31",
            description: "Exportación de prueba",
          },
        }}
      />,
    );

    const generateButton = await screen.findByRole("button", {
      name: /Generar \(\.zip\)/i,
    });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    await waitFor(() => expect(window.URL.createObjectURL).toHaveBeenCalled(), {
      timeout: 5000,
    });
    const [archiveBlob] = window.URL.createObjectURL.mock.calls[0];
    const archive = await JSZip.loadAsync(await readBlobAsArrayBuffer(archiveBlob));
    const html = await archive.file("LogicPath/index.html").async("string");

    expect(html).toContain("const panel = document.createElement('div')");
    expect(html).toContain('data-preview-parity="logicpath"');
    expect(html).toContain('id="start-screen" class="overlay"');
    expect(html).toContain("enableGeneratedInstructionDragAndDrop();");
    expect(html).toContain("event.dataTransfer.setData('application/x-logicpath-instruction', type)");
    expect(html).toContain("bindGeneratedFinishButton();");
    expect(html).toContain("showLaberintoARStageModal('Final')");
    expect(html).toContain("window.setTimeout(showGeneratedStartScreen, 0)");
    expect(html).not.toContain("window.setTimeout(startConfiguredGame, 0)");
    expect(html).not.toContain("logic-path-progress");
    expect(html).not.toContain("setup-progress");
    expect(html).toContain("window.requestAnimationFrame(() => Promise.resolve(");
    expect(html).toContain("max-width: none");

    const page = await openGeneratedHtml(html);
    try {
      const { document: doc, advanceTime } = page;
      advanceTime(6000);
      expect(doc.getElementById("start-screen").classList.contains("hidden")).toBe(false);
      expect(doc.getElementById("game-screen").classList.contains("hidden")).toBe(true);
      expect(doc.getElementById("start-title").textContent).toBe("LogicPath");
      page.window.toggleInfo(true);
      expect(doc.getElementById("info-overlay").classList.contains("hidden")).toBe(false);
      expect(doc.getElementById("info-author-value").textContent).toBe("EducSteam");
      expect(doc.getElementById("info-description-value").textContent).toBe("Exportación de prueba");
      page.window.toggleInfo(false);
      expect(doc.getElementById("info-overlay").classList.contains("hidden")).toBe(true);
      page.window.startGameSequence();
      expect(doc.getElementById("countdown-screen").classList.contains("hidden")).toBe(false);
      advanceTime(5016);
      expect(doc.getElementById("start-screen").classList.contains("hidden")).toBe(true);
      expect(doc.getElementById("game-screen").classList.contains("hidden")).toBe(false);
      expect(doc.querySelector(".game-layout")).not.toBeNull();
    } finally { page.close(); }
  });

  test("usa las plantillas móviles de Laberinto publicadas por el generador", () => {
    expect(LOGIC_PATH_NATIVE_TEMPLATE_URLS).toEqual({
      android: "/templates/laberinto_android.zip",
      ios: "/templates/laberinto_ios.zip",
    });
  });
});
