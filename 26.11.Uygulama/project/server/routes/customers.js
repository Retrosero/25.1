import express from 'express';
import { connectDB, sql } from '../config/db.js';
import { mockCustomers } from '../data/mockCustomers.js';

const router = express.Router();
const USE_MOCK_DATA = process.env.NODE_ENV !== 'production';

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    if (USE_MOCK_DATA) {
      let filteredCustomers = mockCustomers;
      if (search) {
        filteredCustomers = mockCustomers.filter(customer => 
          customer.name.toLowerCase().includes(search.toLowerCase()) ||
          customer.id.toLowerCase().includes(search.toLowerCase()) ||
          customer.taxNumber.includes(search)
        );
      }
      return res.json(filteredCustomers);
    }

    const pool = await connectDB();
    let query = `
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
    `;

    if (search) {
      query += `
        WHERE cari_unvan1 LIKE @search 
        OR cari_kod LIKE @search 
        OR cari_vdaire_no LIKE @search
      `;
    }

    const result = await pool.request()
      .input('search', sql.NVarChar, search ? `%${search}%` : null)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Error fetching customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    if (USE_MOCK_DATA) {
      const customer = mockCustomers.find(c => c.id === req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      return res.json(customer);
    }

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
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Error fetching customer' });
  }
});

// Get customer balance
router.get('/:id/balance', async (req, res) => {
  try {
    if (USE_MOCK_DATA) {
      const customer = mockCustomers.find(c => c.id === req.params.id);
      return res.json({ balance: customer?.balance || 0 });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`
        SELECT SUM(bakiye) as balance
        FROM CARI_HESAP_HAREKETLERI
        WHERE cari_kod = @id
      `);

    res.json({ balance: result.recordset[0]?.balance || 0 });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ error: 'Error fetching balance' });
  }
});

export default router;