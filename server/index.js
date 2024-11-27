import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sql } from './config/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Müşteri listesi endpoint'i
app.get('/api/customers', async (req, res) => {
  try {
    const pool = await connectDB();
    const { search } = req.query;

    let query = `
      SELECT 
        cari_kod as id,
        cari_unvan1 as name,
        cari_vdaire_no as taxNumber,
        cari_EMail as email,
        cari_CepTel as phone,
        cari_create_date as createDate,
        cari_lastup_date as updateDate,
        cari_vdaire_adi as taxOffice
      FROM CARI_HESAPLAR
    `;

    if (search) {
      query += `
        WHERE cari_unvan1 LIKE @search 
        OR cari_kod LIKE @search 
        OR cari_vdaire_no LIKE @search
        OR cari_CepTel LIKE @search
      `;
    }

    const result = await pool.request()
      .input('search', sql.NVarChar, search ? `%${search}%` : null)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Müşteri verileri alınırken bir hata oluştu' });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});