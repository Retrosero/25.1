import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/cari-adres:
 *   get:
 *     tags: [Cari Yönetimi]
 *     summary: Tüm cari hesap adreslerini listeler
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
router.get('/cari-adres', async (req, res) => {
  try {
    const pool = await connectDB();
    const { cariKod } = req.query;

    let query = `
      SELECT 
        adr_create_date,
        adr_lastup_date,
        adr_cari_kod,
        adr_cadde,
        adr_mahalle,
        adr_sokak,
        adr_Semt,
        adr_Apt_No,
        adr_Daire_No,
        adr_posta_kodu,
        adr_ilce,
        adr_il
      FROM CARI_HESAP_ADRESLERI
      WHERE 1=1
    `;

    if (cariKod) {
      query += ` AND adr_cari_kod = @cariKod`;
    }

    const request = pool.request();
    if (cariKod) {
      request.input('cariKod', sql.NVarChar, cariKod);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Adres bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Adres bilgileri alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-adres/{cariKod}:
 *   get:
 *     summary: Belirli bir müşterinin adreslerini getirir
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
 *         description: Adres bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/cari-adres/:cariKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('cariKod', sql.NVarChar, req.params.cariKod)
      .query(`
        SELECT * FROM CARI_HESAP_ADRESLERI 
        WHERE adr_cari_kod = @cariKod
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Adres bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Adres bilgisi alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-adres/sync:
 *   get:
 *     summary: Belirli bir tarihten sonra güncellenen adresleri getirir
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
router.get('/cari-adres/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM CARI_HESAP_ADRESLERI`;
    if (after) {
      query += ` WHERE adr_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Güncel adresler alınırken hata:', err);
    res.status(500).json({ error: 'Güncel adresler alınamadı' });
  }
});

export default router;