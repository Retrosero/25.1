import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/cari-yetkili:
 *   get:
 *     tags: [Cari Yönetimi]
 *     summary: Tüm cari hesap yetkililerini listeler
 */
// Tüm cari hesap yetkililerini getir
router.get('/cari-yetkili', async (req, res) => {
  try {
    const pool = await connectDB();
    const { cariKod } = req.query;

    let query = `
      SELECT 
        yet_cari_kod,
        yet_adi,
        yet_soyadi,
        yet_gorevi,
        yet_tel,
        yet_GSM,
        yet_EMail,
        yet_create_date,
        yet_lastup_date
      FROM CARI_HESAP_YETKILILERI
      WHERE 1=1
    `;

    if (cariKod) {
      query += ` AND yet_cari_kod = @cariKod`;
    }

    const request = pool.request();
    if (cariKod) {
      request.input('cariKod', sql.NVarChar, cariKod);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Yetkili bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Yetkili bilgileri alınamadı' });
  }
});

// Belirli bir müşterinin yetkililerini getir
router.get('/cari-yetkili/:cariKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('cariKod', sql.NVarChar, req.params.cariKod)
      .query(`
        SELECT * FROM CARI_HESAP_YETKILILERI 
        WHERE yet_cari_kod = @cariKod
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Yetkili bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Yetkili bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Yetkili bilgisi alınamadı' });
  }
});

// Belirli bir tarihten sonra güncellenen yetkilileri getir
router.get('/cari-yetkili/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM CARI_HESAP_YETKILILERI`;
    if (after) {
      query += ` WHERE yet_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Güncel yetkililer alınırken hata:', err);
    res.status(500).json({ error: 'Güncel yetkililer alınamadı' });
  }
});

export default router;