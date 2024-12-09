import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

// Get all invoices
router.get('/fatura', async (req, res) => {
  try {
    const pool = await connectDB();
    const { search, startDate, endDate } = req.query;

    let query = `
      SELECT 
        fat_no,
        fat_seri,
        fat_sira_no,
        fat_tarih,
        fat_cari_kod,
        fat_toplam,
        fat_kdv_toplam,
        fat_genel_toplam,
        fat_create_date,
        fat_lastup_date
      FROM FATURALAR
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (fat_no LIKE @search OR fat_cari_kod LIKE @search)`;
    }

    if (startDate) {
      query += ` AND fat_tarih >= @startDate`;
    }

    if (endDate) {
      query += ` AND fat_tarih <= @endDate`;
    }

    const request = pool.request()
      .input('search', sql.NVarChar, search ? `%${search}%` : null);

    if (startDate) {
      request.input('startDate', sql.DateTime, new Date(startDate));
    }
    if (endDate) {
      request.input('endDate', sql.DateTime, new Date(endDate));
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/fatura/:id', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`
        SELECT * FROM FATURALAR WHERE fat_no = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Get invoices updated after a specific date
router.get('/fatura/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM FATURALAR`;
    if (after) {
      query += ` WHERE fat_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching updated invoices:', err);
    res.status(500).json({ error: 'Failed to fetch updated invoices' });
  }
});

export default router;