// Pomocniczy moduł do zarządzania połączeniem z bazą danych
import mysql from "mysql2/promise";

class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log("Połączono z bazą danych MySQL");
      return true;
    } catch (error) {
      console.error("Błąd połączenia z bazą danych:", error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log("Rozłączono z bazą danych");
    }
  }

  async query(sql, params = []) {
    if (!this.connection) {
      throw new Error("Brak połączenia z bazą danych");
    }
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error("Błąd zapytania SQL:", error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.query("SELECT 1");
      return true;
    } catch (error) {
      return false;
    }
  }

  // Metody pomocnicze dla konkretnych operacji

  async searchProducts(searchTerm, filters) {
    let query = "SELECT * FROM produkty WHERE 1=1";
    const params = [];

    if (searchTerm) {
      query += " AND (nazwa LIKE ? OR kod LIKE ? OR kod_kreskowy LIKE ?)";
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters.bezEAN) {
      query += ' AND (kod_kreskowy IS NULL OR kod_kreskowy = "")';
    }
    if (filters.stanWiekszy0) {
      query += " AND stan > 0";
    }
    if (filters.stanMagOLWiekszy0) {
      query += " AND stan_mag_ol > 0";
    }
    if (filters.stanMagLWiekszy0) {
      query += " AND stan_mag_l > 0";
    }
    if (filters.stanMagOWiekszy0) {
      query += " AND stan_mag_o > 0";
    }

    query += " ORDER BY nazwa LIMIT 100";

    return await this.query(query, params);
  }

  async searchByBarcode(barcode) {
    const query = "SELECT * FROM produkty WHERE kod_kreskowy = ? LIMIT 1";
    return await this.query(query, [barcode]);
  }

  async getProductDetails(productId) {
    const query = `
      SELECT 
        p.*,
        pm.magazyn,
        pm.stan as stan_magazynowy,
        pm.lokalizacja
      FROM produkty p
      LEFT JOIN produkty_magazyny pm ON p.id = pm.produkt_id
      WHERE p.id = ?
    `;
    return await this.query(query, [productId]);
  }

  async savePrintHistory(printData) {
    const query = `
      INSERT INTO historia_drukowania 
      (produkt_id, kod_towaru, ilosc_etykiet, kraj_pochodzenia, data_druku, uzytkownik)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `;
    const result = await this.query(query, [
      printData.productId,
      printData.kodTowaru,
      printData.ilosc,
      printData.krajPochodzenia,
      printData.uzytkownik || "system",
    ]);
    return result;
  }

  async getPrintHistory(limit = 50) {
    const query = `
      SELECT 
        h.*,
        p.nazwa as nazwa_produktu
      FROM historia_drukowania h
      LEFT JOIN produkty p ON h.produkt_id = p.id
      ORDER BY h.data_druku DESC
      LIMIT ?
    `;
    return await this.query(query, [limit]);
  }
}

export default DatabaseManager;
