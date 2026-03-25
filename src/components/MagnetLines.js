"use client";

import React, { useEffect, useRef } from "react";

export default function MagnetLines({
  rows = 10,
  columns = 12,
  containerSize = "40vmin",
  lineColor = "tomato",
  lineWidth = "2px",
  lineHeight = "30px",
  baseAngle = 0,
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Simple magnetic effect logic
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const lines = containerRef.current.querySelectorAll('.magnet-line');
      lines.forEach(line => {
        const rect = line.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        line.style.transform = `rotate(${angle + baseAngle}deg)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [baseAngle]);

  const cells = [];
  for (let i = 0; i < rows * columns; i++) {
    cells.push(
      <div key={i} className="magnet-cell" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        <div className="magnet-line" style={{
          width: lineWidth,
          height: lineHeight,
          backgroundColor: lineColor,
          borderRadius: '2px',
          transition: 'transform 0.1s ease-out'
        }} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{
      ...style,
      display: 'grid',
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      width: containerSize,
      height: containerSize,
    }}>
      {cells}
    </div>
  );
}
