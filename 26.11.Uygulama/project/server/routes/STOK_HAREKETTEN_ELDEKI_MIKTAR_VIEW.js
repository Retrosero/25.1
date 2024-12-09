import express from 'express';
import { connectDB, sql } from '../config/db.js';
import { cacheMiddleware } from '../lib/cache.js';

const router = express.Router();

/**
 * @swagger
 * /api/stok-eldeki-miktar:
 *   get:
 *     summary: Tüm stokların eldeki miktarlarını listeler
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
router.get('/stok-eldeki-miktar', cacheMiddleware('stok-eldeki-miktar'), async (req, res) => {
  try {
    const pool = await connectDB();
    const { stokKod } = req.query;

    let query = `
      SELECT 
        sth_stok_kod,
        sth_eldeki_miktar
      FROM STOK_HAREKETTEN_ELDEKI_MIKTAR_VIEW
      WHERE 1=1
    `;

    if (stokKod) {
      query += ` AND sth_stok_kod = @stokKod`;
    }

    const request = pool.request();
    if (stokKod) {
      request.input('stokKod', sql.NVarChar, stokKod);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Eldeki miktar bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Eldeki miktar bilgileri alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok-eldeki-miktar/{stokKod}:
 *   get:
 *     summary: Belirli bir stokun eldeki miktarını getirir
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
 *         description: Stok bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok-eldeki-miktar/:stokKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('stokKod', sql.NVarChar, req.params.stokKod)
      .query(`
        SELECT * FROM STOK_HAREKETTEN_ELDEKI_MIKTAR_VIEW 
        WHERE sth_stok_kod = @stokKod
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Stok bulunamadı' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Eldeki miktar bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Eldeki miktar bilgisi alınamadı' });
  }
});

export default router;