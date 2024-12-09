import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/stok-fiyat:
 *   get:
 *     tags: [Stok Yönetimi]
 *     summary: Tüm stok satış fiyatlarını listeler
 *     parameters:
 *       - name: stokKod
 *         in: query
 *         description: Stok kodu ile filtreleme
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok-fiyat', async (req, res) => {
  try {
    const pool = await connectDB();
    const { stokKod, listeNo } = req.query;

    let query = `
      SELECT 
        sfiyat_create_date,
        sfiyat_lastup_date,
        sfiyat_stokkod,
        sfiyat_listesirano,
        sfiyat_fiyati
      FROM STOK_SATIS_FIYAT_LISTELERI
      WHERE 1=1
    `;

    if (stokKod) {
      query += ` AND sfiyat_stokkod = @stokKod`;
    }
    
    if (listeNo) {
      query += ` AND sfiyat_listesirano = @listeNo`;
    }
    
    query += ` ORDER BY sfiyat_listesirano`;

    const request = pool.request();
    if (stokKod) {
      request.input('stokKod', sql.NVarChar, stokKod);
    }
    if (listeNo) {
      request.input('listeNo', sql.Int, parseInt(listeNo));
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fiyat listesi alınırken hata:', err);
    res.status(500).json({ error: 'Fiyat listesi alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok-fiyat/{stokKod}:
 *   get:
 *     summary: Belirli bir stokun fiyat listesini getirir
 *     parameters:
 *       - name: stokKod
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Fiyat listesi bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok-fiyat/:stokKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('stokKod', sql.NVarChar, req.params.stokKod)
      .query(`
        SELECT * FROM STOK_SATIS_FIYAT_LISTELERI 
        WHERE sfiyat_stokkod = @stokKod
        ORDER BY sfiyat_listesirano
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Fiyat listesi bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Fiyat listesi alınırken hata:', err);
    res.status(500).json({ error: 'Fiyat listesi alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok-fiyat/sync:
 *   get:
 *     summary: Belirli bir tarihten sonra güncellenen fiyat listelerini getirir
 *     parameters:
 *       - name: after
 *         in: query
 *         description: Bu tarihten sonra güncellenen kayıtları getirir
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok-fiyat/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM STOK_SATIS_FIYAT_LISTELERI`;
    if (after) {
      query += ` WHERE sfiyat_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Güncel fiyat listeleri alınırken hata:', err);
    res.status(500).json({ error: 'Güncel fiyat listeleri alınamadı' });
  }
});

export default router;