export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Müşteri Yönetim API',
      version: '1.0.0',
      description: 'Mikro API Dokümantasyonu',
    },
    tags: [
      { 
        name: 'Cari Yönetimi',
        description: 'Cari hesap, adres, yetkili ve hareket işlemleri'
      },
      { 
        name: 'Stok Yönetimi',
        description: 'Stok, hareket, fiyat ve barkod işlemleri'
      }
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme Ortamı'
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Hata mesajı'
            }
          }
        }
      }
    },
    paths: {
      '/api/cari-hareket': {
        get: {
          summary: 'Tüm cari hesap hareketlerini listeler',
          parameters: [
            {
              name: 'cariKod',
              in: 'query',
              description: 'Cari kodu ile filtreleme',
              required: false,
              schema: { type: 'string' }
            },
            {
              name: 'startDate',
              in: 'query',
              description: 'Başlangıç tarihi',
              required: false,
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'Bitiş tarihi',
              required: false,
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            200: { description: 'Başarılı' },
            500: { description: 'Sunucu hatası' }
          }
        }
      },
      '/api/cari-adres': {
        get: {
          summary: 'Tüm cari hesap adreslerini listeler',
          parameters: [
            {
              name: 'cariKod',
              in: 'query',
              description: 'Cari kodu ile filtreleme',
              required: false,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Başarılı' },
            500: { description: 'Sunucu hatası' }
          }
        }
      },
      '/api/barkod': {
        get: {
          summary: 'Tüm barkodları listeler',
          parameters: [
            {
              name: 'stokKodu',
              in: 'query',
              description: 'Stok kodu ile filtreleme',
              required: false,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Başarılı' },
            500: { description: 'Sunucu hatası' }
          }
        }
      },
      '/api/cari-hesap': {
        get: {
          summary: 'Tüm cari hesapları listeler',
          parameters: [
            {
              name: 'search',
              in: 'query',
              description: 'Arama terimi',
              required: false,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Başarılı' },
            500: { description: 'Sunucu hatası' }
          }
        }
      },
      '/api/cari-hareket-ozet': {
        get: {
          summary: 'Tüm cari hesap hareketleri özetlerini listeler',
          parameters: [
            {
              name: 'cariKod',
              in: 'query',
              description: 'Cari kodu ile filtreleme',
              required: false,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Başarılı' },
            500: { description: 'Sunucu hatası' }
          }
        }
      },
      '/api/stok': {
        get: {
          summary: 'Tüm stokları listeler',
          parameters: [
            {
              name: 'search',
              in: 'query',
              description: 'Stok kodu veya ismi ile arama',
              required: false,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Başarılı' },
            500: { description: 'Sunucu hatası' }
          }
        }
      }
    }
  },
  apis: ['./server/routes/*.js'],
};