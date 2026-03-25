"use client";

import React, { useEffect, useState } from "react";

export default function ClickSpark() {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const id = Date.now();
      const newSpark = { id, x: e.clientX, y: e.clientY };
      setSparks((prev) => [...prev, newSpark]);
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== id));
      }, 600);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="spark-animation"
          style={{
            position: "absolute",
            left: spark.x,
            top: spark.y,
            width: "10px",
            height: "10px",
            background: "var(--primary)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes spark {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        .spark-animation {
          animation: spark 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
