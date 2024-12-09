import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/barkod:
 *   get:
 *     tags: [Stok Yönetimi]
 *     summary: Tüm barkod tanımlarını listeler
 */
// Tüm barkod tanımlarını getir
router.get('/barkod', async (req, res) => {
  try {
    const pool = await connectDB();
    const { stokKodu } = req.query;

    let query = `
      SELECT 
        bar_create_date,
        bar_lastup_date,
        bar_special1,
        bar_special2,
        bar_special3,
        bar_kodu,
        bar_stokkodu
      FROM BARKOD_TANIMLARI
      WHERE 1=1
    `;

    if (stokKodu) {
      query += ` AND bar_stokkodu = @stokKodu`;
    }

    const request = pool.request();
    if (stokKodu) {
      request.input('stokKodu', sql.NVarChar, stokKodu);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Barkod bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Barkod bilgileri alınamadı' });
  }
});

// Belirli bir stok kodunun barkodlarını getir
router.get('/barkod/:stokKodu', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('stokKodu', sql.NVarChar, req.params.stokKodu)
      .query(`
        SELECT * FROM BARKOD_TANIMLARI 
        WHERE bar_stokkodu = @stokKodu
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Barkod bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Barkod bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Barkod bilgisi alınamadı' });
  }
});

// Belirli bir tarihten sonra güncellenen barkodları getir
router.get('/barkod/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM BARKOD_TANIMLARI`;
    if (after) {
      query += ` WHERE bar_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Güncel barkodlar alınırken hata:', err);
    res.status(500).json({ error: 'Güncel barkodlar alınamadı' });
  }
});

export default router;