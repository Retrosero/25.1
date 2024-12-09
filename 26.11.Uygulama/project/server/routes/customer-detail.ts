// src/routes/customer-detail.ts
import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

// Müşteri detayını getir
router.get('/:id', async (req, res) => {
  try {
    const customerId = decodeURIComponent(req.params.id);
    console.log('Fetching customer detail:', customerId);

    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, customerId)
      .query(`
        SELECT 
          cari_kod as id,
          cari_unvan1 as name,
          cari_telefon as phone,
          cari_adres as address,
          cari_vergi_no as taxNumber,
          cari_bakiye as balance
        FROM CARI_HESAPLAR WITH(NOLOCK)
        WHERE cari_kod = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Müşteri işlemlerini getir
router.get('/:id/transactions', async (req, res) => {
  try {
    const customerId = decodeURIComponent(req.params.id);
    const { year } = req.query;

    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, customerId)
      .input('year', sql.Int, parseInt(year as string))
      .query(`
        SELECT 
          id,
          tarih as date,
          vade_tarihi as dueDate,
          islem_tipi as type,
          seri as series,
          sira_no as sequence,
          aciklama as description,
          tutar as amount,
          bakiye as balance
        FROM CARI_HESAP_HAREKETLERI WITH(NOLOCK)
        WHERE cari_kod = @id 
        AND YEAR(tarih) = @year
        ORDER BY tarih DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;