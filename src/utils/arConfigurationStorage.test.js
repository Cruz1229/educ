import {
  AR_CONFIGURATION_CLEARED_EVENT,
  clearARConfigurationsAfterDownload,
  clearStoredARConfigurations,
  isARConfigurationStorageKey,
} from "./arConfigurationStorage";

function createStorage(initialEntries) {
  const values = new Map(Object.entries(initialEntries));
  return {
    get length() {
      return values.size;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

describe("AR configuration storage cleanup", () => {
  it("identifies namespaced and legacy AR configuration keys", () => {
    expect(isARConfigurationStorageKey("ar:calculoMental:config")).toBe(true);
    expect(isARConfigurationStorageKey("ar:encriptacion:selectedStages")).toBe(true);
    expect(isARConfigurationStorageKey("robotARConfig")).toBe(true);
    expect(isARConfigurationStorageKey("selectedType_Acierto")).toBe(true);
    expect(isARConfigurationStorageKey("ar:encriptacion:game_config")).toBe(false);
    expect(isARConfigurationStorageKey("unrelated-setting")).toBe(false);
  });

  it("removes all AR content while preserving unrelated game settings", () => {
    const storage = createStorage({
      "ar:calculoMental:config": '{"Acierto":{"text":"Correcto"}}',
      "ar:blockly:selectedStages": '{"Acierto":true}',
      laberintoARConfig: '{"Inicio":{"text":"Laberinto"}}',
      selectedType_Inicio: "Texto",
      "ar:encriptacion:game_config": '{"level":"basic"}',
      theme: "dark",
    });

    const removed = clearStoredARConfigurations(storage);

    expect(removed).toEqual(
      expect.arrayContaining([
        "ar:calculoMental:config",
        "ar:blockly:selectedStages",
        "laberintoARConfig",
        "selectedType_Inicio",
      ]),
    );
    expect(storage.getItem("ar:encriptacion:game_config")).toBe(
      '{"level":"basic"}',
    );
    expect(storage.getItem("theme")).toBe("dark");
  });

  it("announces the cleanup so the active game can reset in-memory content", () => {
    const storage = createStorage({
      "ar:encriptacion:config": '{"Inicio":{"text":"Hola"}}',
    });
    const eventTarget = new EventTarget();
    const listener = jest.fn();
    eventTarget.addEventListener(AR_CONFIGURATION_CLEARED_EVENT, listener);

    clearARConfigurationsAfterDownload({ storage, eventTarget });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.getItem("ar:encriptacion:config")).toBeNull();
  });
});
