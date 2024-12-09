import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /api/cari-hesap:
 *   get:
 *     tags: [Cari Yönetimi]
 *     summary: Tüm cari hesapları listeler
 *     parameters:
 *       - name: search
 *         in: query
 *         description: İsim, kod veya vergi no ile arama
 *         required: false
 *         schema:
 *           type: string
 */
router.get('/cari-hesap', async (req, res) => {
  try {
    const pool = await connectDB();
    const { search } = req.query;

    let query = `
      SELECT 
        cari_kod,
        cari_unvan1 as name,
        cari_unvan2 as name2,
        cari_vdaire_no as taxNumber,
        cari_EMail as email,
        cari_CepTel as phone,
        cari_create_date as createDate,
        cari_lastup_date as updateDate,
        cari_hareket_tipi as transactionType,
        cari_baglanti_tipi as connectionType,
        cari_vdaire_adi as taxOffice,
        cari_sicil_no as registrationNumber,
        cari_VergiKimlikNo as taxId
      FROM CARI_HESAPLAR
      WHERE 1=1
    `;

    if (search) {
      query += `
        AND (cari_unvan1 LIKE @search 
        OR cari_kod LIKE @search 
        OR cari_vdaire_no LIKE @search)
      `;
    }

    const request = pool.request();
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Cari hesaplar alınırken hata:', err);
    res.status(500).json({ error: 'Cari hesaplar alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-hesap/{id}:
 *   get:
 *     summary: Belirli bir cari hesabın detaylarını getirir
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/cari-hesap/:id', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`
        SELECT 
          cari_kod as id,
          cari_unvan1 as name,
          cari_unvan2 as name2,
          cari_vdaire_no as taxNumber,
          cari_EMail as email,
          cari_CepTel as phone,
          cari_create_date as createDate,
          cari_lastup_date as updateDate,
          cari_hareket_tipi as transactionType,
          cari_baglanti_tipi as connectionType,
          cari_vdaire_adi as taxOffice,
          cari_sicil_no as registrationNumber,
          cari_VergiKimlikNo as taxId
        FROM CARI_HESAPLAR 
        WHERE cari_kod = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Cari hesap alınırken hata:', err);
    res.status(500).json({ error: 'Cari hesap alınamadı' });
  }
});

/**
 * @swagger
 * /api/cari-hesap/{id}/balance:
 *   get:
 *     summary: Belirli bir cari hesabın bakiyesini getirir
 */
router.get('/cari-hesap/:id/balance', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`
        SELECT SUM(cha_meblag) as balance
        FROM CARI_HESAP_HAREKETLERI
        WHERE cha_kod = @id
      `);

    res.json({ balance: result.recordset[0]?.balance || 0 });
  } catch (err) {
    console.error('Bakiye alınırken hata:', err);
    res.status(500).json({ error: 'Bakiye alınamadı' });
  }
});

export default router;