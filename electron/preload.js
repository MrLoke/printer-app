const { contextBridge, ipcRenderer } = require("electron");

// Eksponujemy obiekt 'dbAPI' (lub dowolna inna nazwa) do okna przeglądarki (Reacta)
contextBridge.exposeInMainWorld("dbAPI", {
  // 1. Wyszukiwanie produktów
  searchProducts: (searchTerm, filters) =>
    ipcRenderer.invoke("search-products", searchTerm, filters),

  // 2. Pobieranie szczegółów konkretnego produktu
  getProductDetails: (productId) =>
    ipcRenderer.invoke("get-product-details", productId),

  // 3. Wyszukiwanie po kodzie kreskowym (skaner)
  searchByBarcode: (barcode) =>
    ipcRenderer.invoke("search-by-barcode", barcode),

  // 4. Zapisywanie historii drukowania
  savePrintHistory: (printData) =>
    ipcRenderer.invoke("save-print-history", printData),

  // 5. Pobieranie historii drukowania
  getPrintHistory: (limit) => ipcRenderer.invoke("get-print-history", limit),

  // Opcjonalnie: Nasłuchiwanie na zdarzenia z menu (np. skrót klawiszowy Ctrl+P)
  onPrintRequest: (callback) =>
    ipcRenderer.on("trigger-print", (event, args) => callback(args)),
});
