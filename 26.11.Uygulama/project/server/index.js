import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './swagger.js';
import { connectDB, sql } from './config/db.js';
import cariHareketRouter from './routes/CARI_HESAP_HAREKETLERI.js';
import cariHesapRouter from './routes/CARI_HESAPLAR.js';
import stoklarRouter from './routes/STOKLAR.js';
import cariAdresRouter from './routes/CARI_HESAP_ADRESLERI.js';
import cariYetkiliRouter from './routes/CARI_HESAP_YETKILILERI.js';
import barkodRouter from './routes/BARKOD_TANIMLARI.js';
import stokHareketRouter from './routes/STOK_HAREKETLERI.js';
import stokEldekiMiktarRouter from './routes/STOK_HAREKETTEN_ELDEKI_MIKTAR_VIEW.js';
import stokFiyatRouter from './routes/STOK_SATIS_FIYAT_LISTELERI.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api', cariHareketRouter);
app.use('/api', cariHesapRouter);
app.use('/api', stoklarRouter);
app.use('/api', cariAdresRouter);
app.use('/api', cariYetkiliRouter);
app.use('/api', barkodRouter);
app.use('/api', stokHareketRouter);
app.use('/api', stokEldekiMiktarRouter);
app.use('/api', stokFiyatRouter);

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});