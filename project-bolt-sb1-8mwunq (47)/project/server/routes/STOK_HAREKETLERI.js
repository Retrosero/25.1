import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/stok-hareket:
 *   get:
 *     tags: [Stok Yönetimi]
 *     summary: Tüm stok hareketlerini listeler
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
router.get('/stok-hareket', async (req, res) => {
  try {
    const pool = await connectDB();
    const { stokKod } = req.query;

    let query = `
      SELECT 
        sth_create_date,
        sth_lastup_date,
        sth_tip,
        sth_cins,
        sth_normal_iade,
        sth_evraktip,
        sth_evrakno_seri,
        sth_evrakno_sira,
        sth_stok_kod,
        sth_cari_kodu,
        sth_miktar,
        sth_tutar,
        sth_iskonto1,
        sth_iskonto2,
        sth_iskonto3,
        sth_iskonto4,
        sth_iskonto5,
        sth_iskonto6,
        sth_aciklama
      FROM STOK_HAREKETLERI
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
    console.error('Stok hareket bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Stok hareket bilgileri alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok-hareket/{stokKod}:
 *   get:
 *     summary: Belirli bir stokun hareketlerini getirir
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
 *         description: Stok hareketi bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok-hareket/:stokKod', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('stokKod', sql.NVarChar, req.params.stokKod)
      .query(`
        SELECT * FROM STOK_HAREKETLERI 
        WHERE sth_stok_kod = @stokKod
        ORDER BY sth_create_date DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Stok hareketi bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Stok hareket bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Stok hareket bilgisi alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok-hareket/sync:
 *   get:
 *     summary: Belirli bir tarihten sonra güncellenen stok hareketlerini getirir
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
router.get('/stok-hareket/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `SELECT * FROM STOK_HAREKETLERI`;
    if (after) {
      query += ` WHERE sth_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Güncel stok hareketleri alınırken hata:', err);
    res.status(500).json({ error: 'Güncel stok hareketleri alınamadı' });
  }
});

/**
 * @swagger
 * /api/stok-hareket/cari/{sth_cari_kodu}:
 *   get:
 *     summary: Belirli bir cari koda göre stok hareketlerini getirir
 *     parameters:
 *       - name: sth_cari_kodu
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Stok hareketi bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stok-hareket/cari/:sth_cari_kodu', async (req, res) => {
  try {
    const pool = await connectDB();
    const { sth_cari_kodu } = req.params;

    const result = await pool.request()
      .input('sth_cari_kodu', sql.NVarChar, sth_cari_kodu)
      .query(`
        SELECT 
          sth_create_date,
          sth_lastup_date,
          sth_tip,
          sth_cins,
          sth_normal_iade,
          sth_evraktip,
          sth_evrakno_seri,
          sth_evrakno_sira,
          sth_stok_kod,
          sth_cari_kodu,
          sth_miktar,
          sth_tutar,
          sth_iskonto1,
          sth_iskonto2,
          sth_iskonto3,
          sth_iskonto4,
          sth_iskonto5,
          sth_iskonto6,
          sth_aciklama
        FROM STOK_HAREKETLERI
        WHERE sth_cari_kodu = @sth_cari_kodu
        ORDER BY sth_create_date DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Bu cari koda ait stok hareketi bulunamadı' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error('Cari koda göre stok hareket bilgisi alınırken hata:', err);
    res.status(500).json({ error: 'Stok hareket bilgisi alınamadı' });
  }
});

export default router;
