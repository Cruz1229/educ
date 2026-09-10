export const AR_CONFIGURATION_CLEARED_EVENT =
  "steam-g:ar-configuration-cleared";

const LEGACY_AR_STORAGE_KEYS = new Set([
  "cm:ar_config",
  "cm:ar_selected_stages",
  "laberintoARConfig",
  "robotARConfig",
  "selectedLaberintoStages",
  "selectedRobotStages",
  "selectedType_Inicio",
  "selectedType_Acierto",
  "selectedType_Final",
]);

export function isARConfigurationStorageKey(key = "") {
  return (
    LEGACY_AR_STORAGE_KEYS.has(key) ||
    /^ar:[^:]+:(?:config|selectedStages)$/i.test(key)
  );
}

export function clearStoredARConfigurations(storage) {
  const targetStorage =
    storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  if (!targetStorage) return [];

  const keysToRemove = [];
  for (let index = 0; index < targetStorage.length; index += 1) {
    const key = targetStorage.key(index);
    if (key && isARConfigurationStorageKey(key)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => targetStorage.removeItem(key));
  return keysToRemove;
}

export function clearARConfigurationsAfterDownload({
  storage,
  eventTarget,
} = {}) {
  const removedKeys = clearStoredARConfigurations(storage);
  const target =
    eventTarget ?? (typeof window !== "undefined" ? window : undefined);

  if (target?.dispatchEvent) {
    const event =
      typeof CustomEvent === "function"
        ? new CustomEvent(AR_CONFIGURATION_CLEARED_EVENT, {
            detail: { removedKeys },
          })
        : new Event(AR_CONFIGURATION_CLEARED_EVENT);
    target.dispatchEvent(event);
  }

  return removedKeys;
}
