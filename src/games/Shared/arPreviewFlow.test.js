import {
  showInitialARBeforePreview,
  showInitialARInPreview,
} from "./arPreviewFlow";

describe("showInitialARInPreview", () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it("mounts Preview and waits for its render before opening Inicio", async () => {
    const events = [];
    let renderPreview;
    window.requestAnimationFrame = jest.fn((callback) => {
      renderPreview = callback;
      return 1;
    });

    const flow = showInitialARInPreview({
      enterPreview: () => events.push("preview"),
      showInitialStage: () => {
        events.push("inicio");
        return Promise.resolve(true);
      },
    });

    expect(events).toEqual(["preview"]);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    renderPreview();
    await flow;

    expect(events).toEqual(["preview", "inicio"]);
  });

  it("returns to configuration when Inicio is cancelled", async () => {
    const events = [];
    window.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };

    const confirmed = await showInitialARInPreview({
      enterPreview: () => events.push("preview"),
      showInitialStage: () => Promise.resolve(false),
      onCancel: () => events.push("configuration"),
    });

    expect(confirmed).toBe(false);
    expect(events).toEqual(["preview", "configuration"]);
  });
});

describe("showInitialARBeforePreview", () => {
  it("enters Preview only after Inicio is confirmed", async () => {
    const events = [];
    let resolveInicio;

    const flow = showInitialARBeforePreview({
      showInitialStage: () =>
        new Promise((resolve) => {
          events.push("inicio");
          resolveInicio = resolve;
        }),
      enterPreview: () => events.push("preview"),
    });

    expect(events).toEqual(["inicio"]);

    resolveInicio(true);
    await flow;

    expect(events).toEqual(["inicio", "preview"]);
  });

  it("stays outside Preview when Inicio is cancelled", async () => {
    const events = [];

    const confirmed = await showInitialARBeforePreview({
      showInitialStage: () => Promise.resolve(false),
      enterPreview: () => events.push("preview"),
      onCancel: () => events.push("configuration"),
    });

    expect(confirmed).toBe(false);
    expect(events).toEqual(["configuration"]);
  });
});
