import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/cari-hareket:
 *   get:
 *     tags: [Cari Yönetimi]
 *     summary: Tüm cari hesap hareketlerini listeler (opsiyonel filtrelerle)
 *     parameters:
 *       - name: cha_kod
 *         in: query
 *         description: cha_kod alanına göre filtreleme
 *         required: false
 *         schema: { type: 'string' }
 *       - name: startDate
 *         in: query
 *         description: Başlangıç tarihi
 *         required: false
 *         schema: { type: 'string', format: 'date' }
 *       - name: endDate
 *         in: query
 *         description: Bitiş tarihi
 *         required: false
 *         schema: { type: 'string', format: 'date' }
 */
router.get('/cari-hareket', async (req, res) => {
  try {
    const pool = await connectDB();
    const { cha_kod, startDate, endDate } = req.query;

    let query = `
      SELECT 
        cha_create_date,
        cha_lastup_date,
        cha_evrak_tip,
        cha_evrakno_seri,
        cha_evrakno_sira,
        cha_tip,
        cha_cinsi,
        cha_normal_Iade,
        cha_aciklama,
        cha_cari_cins,
        cha_kod,
        cha_ciro_cari_kodu,
        cha_meblag
      FROM CARI_HESAP_HAREKETLERI
      WHERE 1=1
    `;

    const request = pool.request();

    if (cha_kod) {
      query += ` AND cha_kod = @cha_kod`;
      request.input('cha_kod', sql.NVarChar, cha_kod);
    }

    if (startDate) {
      query += ` AND cha_create_date >= @startDate`;
      request.input('startDate', sql.DateTime, new Date(startDate));
    }

    if (endDate) {
      query += ` AND cha_create_date <= @endDate`;
      request.input('endDate', sql.DateTime, new Date(endDate));
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Cari hareket bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Cari hareket bilgileri alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-hareket/sync:
 *   get:
 *     summary: Belirli bir tarihten sonra güncellenen hareketleri getirir
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
router.get('/cari-hareket/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM CARI_HESAP_HAREKETLERI`;
    const request = pool.request();

    if (after) {
      query += ` WHERE cha_lastup_date > @after`;
      request.input('after', sql.DateTime, new Date(after));
    }

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Güncel hareketler alınırken hata:', err);
    res.status(500).json({ error: 'Güncel hareketler alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-hareket/{cha_kod}:
 *   get:
 *     summary: Belirtilen cha_kod'a sahip cari hesap hareketlerini getirir
 *     parameters:
 *       - name: cha_kod
 *         in: path
 *         description: Listeleme yapılacak cha_kod değeri
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/cari-hareket/:cha_kod', async (req, res) => {
  try {
    const { cha_kod } = req.params;
    const pool = await connectDB();
    
    let query = `
      SELECT 
        cha_create_date,
        cha_lastup_date,
        cha_evrak_tip,
        cha_evrakno_seri,
        cha_evrakno_sira,
        cha_tip,
        cha_cinsi,
        cha_normal_Iade,
        cha_aciklama,
        cha_cari_cins,
        cha_kod,
        cha_ciro_cari_kodu,
        cha_meblag
      FROM CARI_HESAP_HAREKETLERI
      WHERE cha_kod = @cha_kod
    `;

    const request = pool.request();
    request.input('cha_kod', sql.NVarChar, cha_kod);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Belirtilen cha_kod için cari hareket bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Cari hareket bilgileri alınamadı' });
  }
});

export default router;
