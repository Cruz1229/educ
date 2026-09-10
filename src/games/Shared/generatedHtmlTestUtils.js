import { TextDecoder, TextEncoder } from "util";

// CRA's Jest browser environment does not provide these Node web primitives.
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
const { JSDOM } = require("jsdom");

// Run standalone exports without loading CDN scripts, media, or using real timers.
export async function openGeneratedHtml(html) {
  const dom = new JSDOM(html, {
    url: "https://generated-game.test/",
    runScripts: "outside-only",
  });
  const { window } = dom;
  const { document } = window;
  await new Promise((resolve) =>
    document.addEventListener("DOMContentLoaded", resolve, { once: true }),
  );

  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const schedule = (callback, delay, repeat = false) => {
    const id = ++nextId;
    timers.set(id, { callback, at: now + delay, delay, repeat });
    return id;
  };
  window.setTimeout = (callback, delay = 0) => schedule(callback, delay);
  window.setInterval = (callback, delay) => schedule(callback, delay, true);
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);
  window.requestAnimationFrame = (callback) => schedule(() => callback(now), 16);
  window.cancelAnimationFrame = window.clearTimeout;
  window.HTMLCanvasElement.prototype.getContext = function () {
    return new Proxy({ canvas: this }, {
      get: (context, key) => context[key] || (() => undefined),
    });
  };
  for (const script of document.querySelectorAll("script:not([src])")) {
    window.eval(script.textContent);
  }

  const advanceTime = (milliseconds) => {
    const end = now + milliseconds;
    let iterations = 0;
    while (true) {
      const next = [...timers.entries()]
        .filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      if (++iterations > 10000) throw new Error("Unexpected generated timer loop");
      const [id, timer] = next;
      now = timer.at;
      if (timer.repeat) timer.at += timer.delay;
      else timers.delete(id);
      timer.callback();
    }
    now = end;
  };
  advanceTime(0);
  return { window, document, advanceTime, close: () => window.close() };
}
