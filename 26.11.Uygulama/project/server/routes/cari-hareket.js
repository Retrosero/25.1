import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

// Get all customer transactions
router.get('/cari-hareket', async (req, res) => {
  try {
    const pool = await connectDB();
    const { cariKod, startDate, endDate } = req.query;

    let query = `
      SELECT 
        cha_sira_no,
        cha_evrak_tip,
        cha_evrak_seri,
        cha_evrak_sira,
        cha_tarih,
        cha_cari_kod,
        cha_borc,
        cha_alacak,
        cha_aciklama,
        cha_create_date,
        cha_lastup_date
      FROM CARI_HESAP_HAREKETLERI
      WHERE 1=1
    `;

    if (cariKod) {
      query += ` AND cha_cari_kod = @cariKod`;
    }

    if (startDate) {
      query += ` AND cha_tarih >= @startDate`;
    }

    if (endDate) {
      query += ` AND cha_tarih <= @endDate`;
    }

    const request = pool.request();
    
    if (cariKod) {
      request.input('cariKod', sql.NVarChar, cariKod);
    }
    if (startDate) {
      request.input('startDate', sql.DateTime, new Date(startDate));
    }
    if (endDate) {
      request.input('endDate', sql.DateTime, new Date(endDate));
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching customer transactions:', err);
    res.status(500).json({ error: 'Failed to fetch customer transactions' });
  }
});

// Get customer transaction by ID
router.get('/cari-hareket/:id', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT * FROM CARI_HESAP_HAREKETLERI WHERE cha_sira_no = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Get customer balance
router.get('/cari-hareket/bakiye/:cariKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('cariKod', sql.NVarChar, req.params.cariKod)
      .query(`
        SELECT 
          SUM(cha_borc) as toplam_borc,
          SUM(cha_alacak) as toplam_alacak,
          SUM(cha_alacak - cha_borc) as bakiye
        FROM CARI_HESAP_HAREKETLERI 
        WHERE cha_cari_kod = @cariKod
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching customer balance:', err);
    res.status(500).json({ error: 'Failed to fetch customer balance' });
  }
});

// Get transactions updated after a specific date
router.get('/cari-hareket/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM CARI_HESAP_HAREKETLERI`;
    if (after) {
      query += ` WHERE cha_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching updated transactions:', err);
    res.status(500).json({ error: 'Failed to fetch updated transactions' });
  }
});

export default router;