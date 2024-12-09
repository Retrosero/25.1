import express from 'express';
import { connectDB, sql } from '../config/db.js';
import { cacheMiddleware } from '../lib/cache.js';

const router = express.Router();

/**
 * @swagger
 * /api/stok:
 *   get:
 *     tags: [Stok Yönetimi]
 *     summary: Tüm stokları listeler
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Stok kodu veya ismi ile arama
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok', cacheMiddleware('stoklar'), async (req, res) => {
  try {
    const pool = await connectDB();
    const { search } = req.query;

    let query = `
      SELECT 
        sto_create_date,
        sto_lastup_date,
        sto_kod,
        sto_isim,
        sto_kisa_ismi,
        sto_yer_kod,
        sto_sektor_kodu,
        sto_ambalaj_kodu,
        sto_marka_kodu
      FROM STOKLAR
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (sto_kod LIKE @search OR sto_isim LIKE @search)`;
    }

    const request = pool.request();
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Stok bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Stok bilgileri alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok/{kod}:
 *   get:
 *     summary: Belirli bir stok kodunun bilgilerini getirir
 *     parameters:
 *       - name: kod
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
router.get('/stok/:kod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('kod', sql.NVarChar, req.params.kod)
      .query(`
        SELECT * FROM STOKLAR 
        WHERE sto_kod = @kod
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Stok bulunamadı' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Stok bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Stok bilgisi alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok/sync:
 *   get:
 *     summary: Belirli bir tarihten sonra güncellenen stokları getirir
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
    console.error('Güncel stoklar alınırken hata:', err);
    res.status(500).json({ error: 'Güncel stoklar alınamadı' });
  }
});

export default router;