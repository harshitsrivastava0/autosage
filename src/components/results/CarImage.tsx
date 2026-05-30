"use client";

import { useState } from "react";
import type { BodyType } from "@/types";

interface CarImageProps {
  src: string;
  alt: string;
  bodyType: BodyType;
  className?: string;
}

/** Shimmer skeleton while loading; falls back to body-type SVG on error. */
export function CarImage({ src, alt, bodyType, className = "" }: CarImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const fallback = `/cars/${bodyType}-placeholder.svg`;
  const imgSrc = errored ? fallback : src;

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      {/* Shimmer shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true); }}
      />
    </div>
  );
}
