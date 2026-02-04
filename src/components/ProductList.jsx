import React from "react";

function ProductList({ products, selectedProduct, onProductSelect }) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <div
          key={product.id}
          className={`product-item ${selectedProduct?.id === product.id ? "selected" : ""}`}
          onClick={() => onProductSelect(product)}
        >
          {product.nazwa}
        </div>
      ))}
      {products.length === 0 && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#444",
            fontSize: "13px",
          }}
        >
          Brak wyników.
        </div>
      )}
    </div>
  );
}

export default ProductList;
