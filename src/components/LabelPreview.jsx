import React from "react";
import Barcode from "./Barcode";

function LabelPreview({ barcode, productName }) {
  return (
    <div className="label-preview-container">
      <div className="label-preview">
        <div className="label-barcode">
          <Barcode value={barcode} />
        </div>
        <div className="label-product-name">{productName}</div>
      </div>
    </div>
  );
}

export default LabelPreview;
