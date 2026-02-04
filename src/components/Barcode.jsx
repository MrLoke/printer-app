import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

function Barcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "EAN13",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          margin: 10,
        });
      } catch (error) {
        console.error("Błąd generowania kodu kreskowego:", error);
      }
    }
  }, [value]);

  return <svg ref={svgRef}></svg>;
}

export default Barcode;
