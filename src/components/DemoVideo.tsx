"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface DemoVideoProps {
  playText: string;
  badgeText: string;
  altText: string;
  priority?: boolean;
}

export function DemoVideo({ playText, badgeText, altText, priority = false }: DemoVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Only mount the <video> once the section is near the viewport, so its bytes
  // (or even its metadata request) never touch the page load.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "320px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const start = () => {
    setPlaying(true);
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
    });
  };

  return (
    <div ref={frameRef} className="demo-video">
      <div className="demo-video__frame">
        {near ? (
          <video
            ref={videoRef}
            className="demo-video__player"
            src="/media/najih-demo.mp4"
            poster="/media/najih-demo-poster.webp"
            preload={playing ? "auto" : "metadata"}
            playsInline
            controls={playing}
            onPlay={() => setPlaying(true)}
            aria-label={altText}
          />
        ) : null}

        {!playing ? (
          <button type="button" className="demo-video__poster" onClick={start} aria-label={playText}>
            <Image
              src="/media/najih-demo-poster.webp"
              alt={altText}
              fill
              sizes="(max-width: 976px) 92vw, 620px"
              className="object-cover"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              decoding="async"
            />
            <span className="demo-video__veil" aria-hidden />
            <span className="demo-video__play">
              <span className="demo-video__play-icon" aria-hidden>
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M8 5.5v13l11-6.5-11-6.5z" />
                </svg>
              </span>
              {playText}
            </span>
            <span className="demo-video__badge" aria-hidden>
              {badgeText}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}