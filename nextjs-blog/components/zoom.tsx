// components/zoom.tsx
"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { image } from "@kanorio/sdk";

// Body images use the display size; the zoom view asks Kanorio for a larger one (never enlarged past the original)
const ZOOM_WIDTH = 2560;

type Zoomed = { src: string; alt: string };

function ZoomDialog({ zoomed, onClose }: { zoomed: Zoomed | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (zoomed && !dialog.current?.open) dialog.current?.showModal();
  }, [zoomed]);
  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={() => dialog.current?.close()}
      style={{ padding: 0, border: 0, background: "transparent", maxWidth: "100vw", maxHeight: "100vh", cursor: "zoom-out" }}
    >
      {zoomed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={zoomed.src} alt={zoomed.alt} style={{ display: "block", maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }} />
      )}
    </dialog>
  );
}

/** One image that opens in the zoom view: a gallery image whose segment has `lightbox: true` */
export function ZoomableImage({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) {
  const [zoomed, setZoomed] = useState<Zoomed | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setZoomed({ src: image.url(src, { width: ZOOM_WIDTH }), alt })}
        style={{ padding: 0, border: 0, background: "none", cursor: "zoom-in", display: "block", width: "100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} srcSet={image.srcSet(src)} sizes="(max-width: 768px) 100vw, 50vw" alt={alt} width={width} height={height} loading="lazy" style={{ width: "100%", height: "auto" }} />
      </button>
      <ZoomDialog zoomed={zoomed} onClose={() => setZoomed(null)} />
    </>
  );
}

const MARKED = 'img[data-kanorio-lightbox="true"]';

/**
 * `contentHtml` with the zoom view on the images the site owner marked with `data-kanorio-lightbox`.
 * Images inside a link are never marked: a click on them follows the link.
 */
export function ZoomableHtml({ html }: { html: string }) {
  const body = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState<Zoomed | null>(null);

  // The marked images become reachable and usable from the keyboard
  useEffect(() => {
    for (const img of body.current?.querySelectorAll<HTMLImageElement>(MARKED) ?? []) {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.style.cursor = "zoom-in";
    }
  }, [html]);

  const open = (target: EventTarget) => {
    const img = target instanceof Element ? target.closest<HTMLImageElement>(MARKED) : null;
    if (!img) return false;
    setZoomed({ src: image.url(img.currentSrc || img.src, { width: ZOOM_WIDTH }), alt: img.alt });
    return true;
  };
  const onClick = (event: MouseEvent) => {
    open(event.target);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && open(event.target)) event.preventDefault();
  };

  return (
    <>
      {/* The handlers only act on the marked images, which get role="button" and a tab stop above */}
      <div ref={body} onClick={onClick} onKeyDown={onKeyDown} dangerouslySetInnerHTML={{ __html: html }} />
      <ZoomDialog zoomed={zoomed} onClose={() => setZoomed(null)} />
    </>
  );
}
