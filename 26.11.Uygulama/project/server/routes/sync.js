import express from 'express';
import { connectDB, sql } from '../config/db.js';

const router = express.Router();

// Get customers updated after a specific date
router.get('/customers/sync', async (req, res) => {
  try {
    const { after } = req.query;
    const pool = await connectDB();
    
    let query = `
      SELECT 
        cari_kod,
        cari_unvan1,
        cari_unvan2,
        cari_vdaire_no,
        cari_EMail,
        cari_CepTel,
        cari_create_date,
        cari_lastup_date,
        cari_hareket_tipi,
        cari_baglanti_tipi,
        cari_vdaire_adi,
        cari_sicil_no,
        cari_VergiKimlikNo
      FROM CARI_HESAPLAR
    `;

    if (after) {
      query += ` WHERE cari_lastup_date > @after`;
    }

    const result = await pool.request()
      .input('after', sql.DateTime, after || new Date(0))
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching updated customers:', err);
    res.status(500).json({ error: 'Failed to fetch updated customers' });
  }
});

// Receive local changes from client
router.post('/customers/sync', async (req, res) => {
  try {
    const changes = req.body;
    const pool = await connectDB();
    
    for (const customer of changes) {
      await pool.request()
        .input('cari_kod', sql.NVarChar, customer.cari_kod)
        .input('cari_unvan1', sql.NVarChar, customer.cari_unvan1)
        .input('cari_unvan2', sql.NVarChar, customer.cari_unvan2)
        .input('cari_vdaire_no', sql.NVarChar, customer.cari_vdaire_no)
        .input('cari_EMail', sql.NVarChar, customer.cari_EMail)
        .input('cari_CepTel', sql.NVarChar, customer.cari_CepTel)
        .input('cari_lastup_date', sql.DateTime, new Date())
        .query(`
          UPDATE CARI_HESAPLAR
          SET 
            cari_unvan1 = @cari_unvan1,
            cari_unvan2 = @cari_unvan2,
            cari_vdaire_no = @cari_vdaire_no,
            cari_EMail = @cari_EMail,
            cari_CepTel = @cari_CepTel,
            cari_lastup_date = @cari_lastup_date
          WHERE cari_kod = @cari_kod
        `);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating customers:', err);
    res.status(500).json({ error: 'Failed to update customers' });
  }
});

export default router;