import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/cari-hareket-ozet:
 *   get:
 *     summary: Tüm cari hesap hareketleri özetlerini listeler
 *     parameters:
 *       - name: cariKod
 *         in: query
 *         description: Cari kodu ile filtreleme
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/cari-hareket-ozet', async (req, res) => {
  try {
    const pool = await connectDB();
    const { cariKod } = req.query;

    let query = `
      SELECT 
        cho_Cinsi,
        cho_Carikodu,
        cho_Donem,
        cho_HareketCins,
        cho_Ana_Borc,
        cho_Ana_Alacak,
        cho_Alt_Borc,
        cho_Alt_Alacak,
        cho_Orj_Borc,
        cho_Orj_Alacak
      FROM CARI_HESAP_HAREKETLERI_OZET
      WHERE 1=1
    `;

    if (cariKod) {
      query += ` AND cho_Carikodu = @cariKod`;
    }

    const request = pool.request();
    if (cariKod) {
      request.input('cariKod', sql.NVarChar, cariKod);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Hareket özeti alınırken hata:', err);
    res.status(500).json({ error: 'Hareket özeti alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-hareket-ozet/{cariKod}:
 *   get:
 *     summary: Belirli bir müşterinin hareket özetini getirir
 *     parameters:
 *       - name: cariKod
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Özet bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/cari-hareket-ozet/:cariKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('cariKod', sql.NVarChar, req.params.cariKod)
      .query(`
        SELECT * FROM CARI_HESAP_HAREKETLERI_OZET 
        WHERE cho_Carikodu = @cariKod
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hareket özeti bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Hareket özeti alınırken hata:', err);
    res.status(500).json({ error: 'Hareket özeti alınamadı' });
  }
});

export default router;