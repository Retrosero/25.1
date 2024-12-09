import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/cari-isim:
 *   get:
 *     summary: Tüm cari hesap isimlerini listeler
 *     parameters:
 *       - name: search
 *         in: query
 *         description: İsim ile arama
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/cari-isim', async (req, res) => {
  try {
    const pool = await connectDB();
    const { search } = req.query;

    let query = `
      SELECT 
        CARICINSI,
        CARIKODU,
        CARIISMI
      FROM CARI_HESAP_ISIMLERI
      WHERE 1=1
    `;

    if (search) {
      query += ` AND CARIISMI LIKE @search`;
    }

    const request = pool.request();
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Cari isimler alınırken hata:', err);
    res.status(500).json({ error: 'Cari isimler alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-isim/{kod}:
 *   get:
 *     summary: Belirli bir cari kodunun ismini getirir
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
 *         description: Cari isim bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/cari-isim/:kod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('kod', sql.NVarChar, req.params.kod)
      .query(`
        SELECT * FROM CARI_HESAP_ISIMLERI 
        WHERE CARIKODU = @kod
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cari isim bulunamadı' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Cari isim alınırken hata:', err);
    res.status(500).json({ error: 'Cari isim alınamadı' });
  }
});

export default router;