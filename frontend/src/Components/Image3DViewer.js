import React, { useRef, useEffect, useState } from "react";

// Simple CSS-based 3D tilt viewer for images (no external deps).
// Moves and rotates a plane according to pointer position, with subtle shadow.
export default function Image3DViewer({ src, alt, style }) {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [isPointerDown, setPointerDown] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    function update(e) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1

      // map to -1..1
      const nx = (x - 0.5) * 2;
      const ny = (y - 0.5) * 2;

      const rotY = nx * 12; // degrees
      const rotX = -ny * 12;
      const translateZ = 20 + (isPointerDown ? 10 : 0);

      inner.style.transform = `perspective(800px) translateZ(${translateZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      inner.style.transition = "transform 120ms ease-out";
    }

    function reset() {
      inner.style.transform =
        "perspective(800px) translateZ(18px) rotateX(0deg) rotateY(0deg)";
      inner.style.transition = "transform 450ms cubic-bezier(.2,.9,.2,1)";
    }

    function handlePointerDown() {
      setPointerDown(true);
    }
    function handlePointerUp() {
      setPointerDown(false);
    }

    container.addEventListener("pointermove", update);
    container.addEventListener("pointerleave", reset);
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    // initial
    reset();

    return () => {
      container.removeEventListener("pointermove", update);
      container.removeEventListener("pointerleave", reset);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isPointerDown]);

  return (
    <div
      ref={containerRef}
      style={{
        perspective: 1200,
        display: "inline-block",
        padding: 12,
        borderRadius: 12,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(245,245,245,0.7))",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      <div
        ref={innerRef}
        style={{
          transformStyle: "preserve-3d",
          borderRadius: 8,
          overflow: "hidden",
          transform: "perspective(800px) translateZ(18px)",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}
