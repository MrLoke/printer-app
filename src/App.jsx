import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Barcode from "./components/Barcode";
import ProductList from "./components/ProductList";
import LabelPreview from "./components/LabelPreview";

// Używamy bezpiecznego API z preload.js zamiast bezpośredniego ipcRenderer
const { electronAPI } = window;
const initialTime = Date.now();

// Placeholder products
const PLACEHOLDER_PRODUCTS = [
  {
    id: 1,
    nazwa: "Klamka VENUS M1 mosiadz B/O",
    kod: "VEN-M1-BO",
    stan: 15,
  },
];

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState(PLACEHOLDER_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(
    PLACEHOLDER_PRODUCTS[0],
  );
  const [filters, setFilters] = useState({
    bezEAN: false,
    stanWiekszy0: true,
    stanMagOLWiekszy0: false,
    stanMagLWiekszy0: false,
    stanMagOWiekszy0: false,
  });
  const [scannerBuffer, setScannerBuffer] = useState("");
  const [lastKeyTime, setLastKeyTime] = useState(initialTime);
  const [productDetails, setProductDetails] = useState({
    kodTowaru: "6420334000257",
    stan: 0,
    magazyny: {
      D: 0,
      B: 0,
      E: 0,
      M: 0,
      L: 0,
      D2: 0,
      OL: 0,
      O: 0,
    },
  });
  const [krajPochodzenia, setKrajPochodzenia] = useState("UE");
  const [iloscEtykiet, setIloscEtykiet] = useState(30);

  // Proste sygnały dźwiękowe (opcjonalne)
  const playBeep = () => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz - wysoki dźwięk
    gainNode.gain.value = 0.1; // Głośność

    oscillator.start();
    setTimeout(() => oscillator.stop(), 100); // 100ms beep
  };

  const playErrorBeep = () => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 300; // Hz - niski dźwięk (błąd)
    gainNode.gain.value = 0.1;

    oscillator.start();
    setTimeout(() => oscillator.stop(), 200); // 200ms beep
  };

  const handleProductSelect = useCallback(async (product) => {
    setSelectedProduct(product);
    try {
      const details = await electronAPI.getProductDetails(product.id);
      if (details && details.length > 0) {
        setProductDetails({
          kodTowaru: details[0].kod_kreskowy || "6420334000257",
          stan: details[0].stan || 0,
          magazyny: {
            D: details[0].mag_d || 0,
            B: details[0].mag_b || 0,
            E: details[0].mag_e || 0,
            M: details[0].mag_m || 0,
            L: details[0].mag_l || 0,
            D2: details[0].mag_d2 || 0,
            OL: details[0].mag_ol || 0,
            O: details[0].mag_o || 0,
          },
        });
      }
    } catch (error) {
      console.error("Błąd pobierania szczegółów:", error);
    }
  }, []);

  const handleBarcodeScanned = useCallback(
    async (barcode) => {
      console.log("📷 Zeskanowano kod kreskowy:", barcode);

      // Szukaj produktu po kodzie kreskowym
      try {
        const results = await electronAPI.searchByBarcode(barcode);

        if (results && results.length > 0) {
          setProducts(results);
          setSelectedProduct(results[0]);
          handleProductSelect(results[0]);

          // Opcjonalnie: sygnał dźwiękowy potwierdzenia
          playBeep();
        } else {
          console.warn("❌ Nie znaleziono produktu o kodzie:", barcode);
          playErrorBeep();
          alert(`Nie znaleziono produktu o kodzie kreskowym: ${barcode}`);
        }
      } catch (error) {
        console.error("Błąd wyszukiwania po kodzie:", error);
        playErrorBeep();
      }
    },
    [handleProductSelect],
  );

  // Obsługa skanera kodów kreskowych
  useEffect(() => {
    const handleKeyPress = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;

      // Jeśli czas między klawiszami > 100ms, resetuj bufor (to normalne pisanie)
      // Skaner wpisuje bardzo szybko (< 50ms między znakami)
      if (timeDiff > 100) {
        setScannerBuffer("");
      }

      setLastKeyTime(currentTime);

      // Ignoruj jeśli focus jest na input (użytkownik pisze ręcznie)
      if (document.activeElement.tagName === "INPUT") {
        return;
      }

      // Enter = koniec skanowania
      if (e.key === "Enter" && scannerBuffer.length > 0) {
        e.preventDefault();
        handleBarcodeScanned(scannerBuffer);
        setScannerBuffer("");
        return;
      }

      // Zbieraj znaki (tylko cyfry i litery dla kodów kreskowych)
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setScannerBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [scannerBuffer, lastKeyTime, handleBarcodeScanned]);

  const handleSearch = async () => {
    try {
      const results = await electronAPI.searchProducts(searchTerm, filters);
      setProducts(results);
    } catch (error) {
      console.error("Błąd wyszukiwania:", error);
    }
  };

  const handlePrint = async () => {
    const printData = {
      productId: selectedProduct?.id,
      kodTowaru: productDetails.kodTowaru,
      ilosc: iloscEtykiet,
      krajPochodzenia: krajPochodzenia,
    };

    try {
      const result = await electronAPI.savePrintHistory(printData);
      if (result.success) {
        alert(`Drukowanie ${iloscEtykiet} etykiet...`);
        // Tutaj dodasz logikę faktycznego drukowania
      }
    } catch (error) {
      console.error("Błąd drukowania:", error);
    }
  };

  return (
    <div className="app-container">
      {/* Wskaźnik skanera */}
      {scannerBuffer.length > 0 && (
        <div className="scanner-indicator">📷 Skanowanie: {scannerBuffer}</div>
      )}

      <div className="main-content">
        {/* Lewy panel - wyszukiwanie i lista produktów */}
        <div className="left-panel">
          <div className="header">
            <div className="logo">CDN XL ETYKIETY</div>
          </div>

          <div className="search-section">
            <label>Nazwa produktu / Kod</label>
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="filters-section">
            <label>
              <input
                type="checkbox"
                checked={filters.bezEAN}
                onChange={(e) =>
                  setFilters({ ...filters, bezEAN: e.target.checked })
                }
              />
              bez EAN
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.stanWiekszy0}
                onChange={(e) =>
                  setFilters({ ...filters, stanWiekszy0: e.target.checked })
                }
              />
              Stan &gt; 0
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.stanMagOLWiekszy0}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    stanMagOLWiekszy0: e.target.checked,
                  })
                }
              />
              Stan Mag OL &gt; 0
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.stanMagLWiekszy0}
                onChange={(e) =>
                  setFilters({ ...filters, stanMagLWiekszy0: e.target.checked })
                }
              />
              Stan Mag L &gt; 0
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.stanMagOWiekszy0}
                onChange={(e) =>
                  setFilters({ ...filters, stanMagOWiekszy0: e.target.checked })
                }
              />
              Stan Mag O &gt; 0
            </label>
          </div>

          <ProductList
            products={products}
            selectedProduct={selectedProduct}
            onProductSelect={handleProductSelect}
          />

          <div className="gid-info">GID: 41284</div>
        </div>

        {/* Prawy panel - szczegóły i drukowanie */}
        <div className="right-panel">
          <div className="search-button-container">
            <button className="btn-search" onClick={handleSearch}>
              SZUKAJ
            </button>
          </div>

          <div className="product-details">
            <div className="detail-row">
              <label>Kod towaru</label>
              <div className="detail-value">{productDetails.kodTowaru}</div>
            </div>

            <div className="detail-row">
              <label>Stan</label>
              <div className="detail-value-large">{productDetails.stan}</div>
              <span className="unit">kpl</span>
            </div>

            <div className="magazines-grid">
              <label>Magazyny</label>
              <div className="magazines">
                {Object.entries(productDetails.magazyny).map(([mag, value]) => (
                  <div key={mag} className="magazine-item">
                    <div className="mag-label">{mag}</div>
                    <div className="mag-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-name-display">
              {selectedProduct?.nazwa || "Klamka VENUS M1 mosiadz B/O"}
            </div>
          </div>

          <LabelPreview
            barcode={productDetails.kodTowaru}
            productName={
              selectedProduct?.nazwa || "Klamka VENUS M1 mosiadz B/O"
            }
          />

          <div className="print-options">
            <div className="origin-section">
              <label>Kraj pochodzenia</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="kraj"
                    value="Chiny"
                    checked={krajPochodzenia === "Chiny"}
                    onChange={(e) => setKrajPochodzenia(e.target.value)}
                  />
                  Chiny
                </label>
                <label>
                  <input
                    type="radio"
                    name="kraj"
                    value="Polska"
                    checked={krajPochodzenia === "Polska"}
                    onChange={(e) => setKrajPochodzenia(e.target.value)}
                  />
                  Polska
                </label>
                <label>
                  <input
                    type="radio"
                    name="kraj"
                    value="UE"
                    checked={krajPochodzenia === "UE"}
                    onChange={(e) => setKrajPochodzenia(e.target.value)}
                  />
                  UE
                </label>
                <label>
                  <input
                    type="radio"
                    name="kraj"
                    value="Austria"
                    checked={krajPochodzenia === "Austria"}
                    onChange={(e) => setKrajPochodzenia(e.target.value)}
                  />
                  Austria
                </label>
              </div>
            </div>

            <div className="quantity-section">
              <button className="btn-print" onClick={handlePrint}>
                Drukuj
              </button>
              <input
                type="number"
                className="quantity-input"
                value={iloscEtykiet}
                onChange={(e) => setIloscEtykiet(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-secondary">DocPrint</button>
            <button className="btn-secondary">Zamknij</button>
          </div>

          <div className="footer-text">CDN XL ERPHYB_CDNXAMP15sys</div>
        </div>
      </div>
    </div>
  );
}

export default App;
