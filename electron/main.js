import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import DatabaseManager from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let db;

// Konfiguracja połączenia z bazą danych
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Zmień na swoje dane
  database: "cdn_etykiety",
};

async function createDatabase() {
  try {
    db = new DatabaseManager(dbConfig);
    const connected = await db.connect();
    if (connected) {
      const isWorking = await db.testConnection();
      if (isWorking) {
        console.log("Baza danych działa prawidłowo");
      }
    }
  } catch (error) {
    console.error("Błąd inicjalizacji bazy danych:", error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "../public/icon.png"),
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(async () => {
  await createDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (db) {
      db.disconnect();
    }
    app.quit();
  }
});

// IPC Handlers dla komunikacji z renderem

// Wyszukiwanie produktów
ipcMain.handle("search-products", async (event, searchTerm, filters) => {
  try {
    if (!db) {
      console.error("Brak połączenia z bazą danych");
      return [];
    }
    const results = await db.searchProducts(searchTerm, filters);
    return results;
  } catch (error) {
    console.error("Błąd wyszukiwania:", error);
    return [];
  }
});

// Pobieranie szczegółów produktu
ipcMain.handle("get-product-details", async (event, productId) => {
  try {
    if (!db) {
      console.error("Brak połączenia z bazą danych");
      return null;
    }
    const details = await db.getProductDetails(productId);
    return details;
  } catch (error) {
    console.error("Błąd pobierania szczegółów:", error);
    return null;
  }
});

// Zapisywanie historii drukowania
ipcMain.handle("save-print-history", async (event, printData) => {
  try {
    if (!db) {
      console.error("Brak połączenia z bazą danych");
      return { success: false, error: "Brak połączenia z bazą" };
    }
    const result = await db.savePrintHistory(printData);
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Błąd zapisywania historii:", error);
    return { success: false, error: error.message };
  }
});

// Pobieranie historii drukowania
ipcMain.handle("get-print-history", async (event, limit = 50) => {
  try {
    if (!db) {
      console.error("Brak połączenia z bazą danych");
      return [];
    }
    const history = await db.getPrintHistory(limit);
    return history;
  } catch (error) {
    console.error("Błąd pobierania historii:", error);
    return [];
  }
});

// Wyszukiwanie po kodzie kreskowym (skaner)
ipcMain.handle("search-by-barcode", async (event, barcode) => {
  try {
    if (!db) {
      console.error("Brak połączenia z bazą danych");
      return [];
    }
    console.log("📷 Wyszukiwanie po kodzie kreskowym:", barcode);
    const results = await db.searchByBarcode(barcode);
    console.log(`Znaleziono ${results.length} produktów`);
    return results;
  } catch (error) {
    console.error("Błąd wyszukiwania po kodzie kreskowym:", error);
    return [];
  }
});
