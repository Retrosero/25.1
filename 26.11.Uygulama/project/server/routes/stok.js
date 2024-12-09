import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

// Get all stock items
router.get('/stok', async (req, res) => {
  try {
    const pool = await connectDB();
    const { search } = req.query;

    let query = `
      SELECT 
        sto_kod,
        sto_isim,
        sto_birim1_ad,
        sto_birim2_ad,
        sto_birim3_ad,
        sto_reyon_kodu,
        sto_marka_kodu,
        sto_barkod1,
        sto_barkod2,
        sto_barkod3,
        sto_create_date,
        sto_lastup_date,
        sto_fiyat,
        sto_kdv
      FROM STOKLAR
    `;

    if (search) {
      query += `
        WHERE sto_isim LIKE @search 
        OR sto_kod LIKE @search 
        OR sto_barkod1 LIKE @search
      `;
    }

    const result = await pool.request()
      .input('search', sql.NVarChar, search ? `%${search}%` : null)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching stock items:', err);
    res.status(500).json({ error: 'Failed to fetch stock items' });
  }
});

// Get stock item by ID
router.get('/stok/:id', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`
        SELECT * FROM STOKLAR WHERE sto_kod = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching stock item:', err);
    res.status(500).json({ error: 'Failed to fetch stock item' });
  }
});

// Get stock items updated after a specific date
router.get('/stok/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM STOKLAR`;
    if (after) {
      query += ` WHERE sto_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching updated stock items:', err);
    res.status(500).json({ error: 'Failed to fetch updated stock items' });
  }
});

export default router;