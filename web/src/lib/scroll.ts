export function getAppScroller(): HTMLElement | null {
  return document.getElementById("app-scroll");
}

export function scrollAppToId(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id);
  const scroller = getAppScroller();
  if (!el) return;

  if (!scroller) {
    el.scrollIntoView({ behavior, block: "start" });
    return;
  }

  const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  scroller.scrollTo({ top: Math.max(0, top), behavior });
}

export function lockAppScroll() {
  const scroller = getAppScroller();
  const prevScroller = scroller?.style.overflow ?? "";
  const prevBody = document.body.style.overflow;
  if (scroller) scroller.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  return () => {
    if (scroller) scroller.style.overflow = prevScroller;
    document.body.style.overflow = prevBody;
  };
}
