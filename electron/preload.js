/**
 * Preload Script - Bezpieczny mostek między głównym procesem a rendererem
 *
 * Ten plik działa jako warstwa bezpieczeństwa między UI (renderer) a Node.js (main).
 * Eksponuje tylko wybrane API, zamiast całego Node.js i Electrona.
 */

import { contextBridge, ipcRenderer } from "electron";

// Eksponujemy tylko te funkcje, które są potrzebne w UI
contextBridge.exposeInMainWorld("electronAPI", {
  // Wyszukiwanie produktów
  searchProducts: (searchTerm, filters) =>
    ipcRenderer.invoke("search-products", searchTerm, filters),

  // Wyszukiwanie po kodzie kreskowym (skaner)
  searchByBarcode: (barcode) =>
    ipcRenderer.invoke("search-by-barcode", barcode),

  // Pobieranie szczegółów produktu
  getProductDetails: (productId) =>
    ipcRenderer.invoke("get-product-details", productId),

  // Zapisywanie historii drukowania
  savePrintHistory: (printData) =>
    ipcRenderer.invoke("save-print-history", printData),

  // Pobieranie historii drukowania
  getPrintHistory: (limit) => ipcRenderer.invoke("get-print-history", limit),

  // ==================== DRUKARKA ====================

  // Wykrywanie dostępnych drukarek
  detectPrinters: () => ipcRenderer.invoke("detect-printers"),

  // Łączenie z drukarką USB
  connectPrinterUSB: (vendorId, productId) =>
    ipcRenderer.invoke("connect-printer-usb", vendorId, productId),

  // Łączenie z drukarką sieciową
  connectPrinterNetwork: (ip, port) =>
    ipcRenderer.invoke("connect-printer-network", ip, port),

  // Drukowanie etykiety
  printLabel: (labelData) => ipcRenderer.invoke("print-label", labelData),

  // Test drukarki
  printTestPage: () => ipcRenderer.invoke("print-test-page"),

  // Status drukarki
  getPrinterStatus: () => ipcRenderer.invoke("get-printer-status"),

  // Rozłączanie drukarki
  disconnectPrinter: () => ipcRenderer.invoke("disconnect-printer"),
});

// Możesz też wystawić informacje o środowisku (opcjonalnie)
contextBridge.exposeInMainWorld("appInfo", {
  platform: process.platform,
  version: process.env.npm_package_version || "1.0.0",
  nodeVersion: process.versions.node,
  electronVersion: process.versions.electron,
});

console.log("Preload script załadowany bezpiecznie");
