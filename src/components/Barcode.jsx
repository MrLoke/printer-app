import React, { useEffect, useRef } from "react";

function Barcode({ value }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Czyścimy canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Prosty generator kodu kreskowego (EAN-13 simplified)
    const barWidth = 2;
    const barHeight = 60;
    let x = 10;

    // Generujemy paski na podstawie cyfr kodu
    for (let i = 0; i < value.length; i++) {
      const digit = parseInt(value[i]);
      // Prosta wizualizacja - naprzemienne paski
      if (digit % 2 === 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(x, 10, barWidth, barHeight);
      }
      x += barWidth + 1;
    }

    // Rysujemy tekst pod kodem
    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(value, canvas.width / 2, barHeight + 25);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      width="250"
      height="90"
      style={{ display: "block", margin: "0 auto" }}
    />
  );
}

export default Barcode;
