export const waitForPreviewScreen = () =>
  new Promise((resolve) => {
    if (
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
    ) {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });

export async function showInitialARInPreview({
  enterPreview,
  showInitialStage,
  onCancel,
}) {
  enterPreview();
  await waitForPreviewScreen();

  const confirmed = await showInitialStage();
  if (!confirmed) onCancel?.();

  return Boolean(confirmed);
}

export async function showInitialARBeforePreview({
  enterPreview,
  showInitialStage,
  onCancel,
}) {
  const confirmed = await showInitialStage();

  if (!confirmed) {
    onCancel?.();
    return false;
  }

  enterPreview();
  return true;
}
