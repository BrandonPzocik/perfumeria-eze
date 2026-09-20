function prevent(e: Event) {
  e.preventDefault();
}

function preventPinch(e: TouchEvent) {
  const scale = (e as TouchEvent & { scale?: number }).scale;
  if (e.touches.length > 1 || (typeof scale === "number" && scale !== 1)) prevent(e);
}

export function lockZoom() {
  document.addEventListener("gesturestart", prevent, { passive: false });
  document.addEventListener("gesturechange", prevent, { passive: false });
  document.addEventListener("gestureend", prevent, { passive: false });
  document.addEventListener("touchmove", preventPinch, { passive: false });
}
