import { XMLParser } from 'fast-xml-parser';
import { initProductDB } from './db/product';

async function downloadXML(xmlUrl: string): Promise<string> {
  const response = await fetch(xmlUrl);
  if (!response.ok) {
    throw new Error('XML verisi alınamadı');
  }
  return await response.text();
}

export async function fetchProductImages(xmlUrl: string, productCode: string) {
  const xmlText = await downloadXML(xmlUrl);

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    trimValues: true
  });

  const json = parser.parse(xmlText);

  if (!json.Products?.Product) {
    throw new Error('XML yapısı geçersiz');
  }

  const products = Array.isArray(json.Products.Product)
    ? json.Products.Product
    : [json.Products.Product];

  const product = products.find((p: any) =>
    p.Product_code?.toString().trim() === productCode.toString().trim()
  );

  if (!product) return [];

  const images = [];
  for (let i = 1; i <= 10; i++) {
    const imageUrl = product[`Image${i}`];
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      images.push({
        id: `${productCode}-img-${i}`,
        url: imageUrl.trim(),
        order: i - 1
      });
    }
  }

  return images;
}

export async function syncProductImages(xmlUrl: string) {
  try {
    const xmlText = await downloadXML(xmlUrl);

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true
    });

    const json = parser.parse(xmlText);

    if (!json.Products?.Product) {
      throw new Error('XML yapısı geçersiz');
    }

    const products = Array.isArray(json.Products.Product)
      ? json.Products.Product
      : [json.Products.Product];

    const db = await initProductDB();
    const tx = db.transaction('products', 'readwrite');
    const store = tx.store;

    for (const xmlProduct of products) {
      const productCode = xmlProduct.Product_code?.toString().trim();
      if (!productCode) continue;

      const product = await store.get(productCode);
      if (!product) continue;

      for (let i = 1; i <= 10; i++) {
        const imageUrl = xmlProduct[`Image${i}`];
        product[`images${i}`] = imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : '';
      }

      await store.put(product);
    }

    await tx.done;
    return { success: true, message: 'Ürün resimleri başarıyla güncellendi' };
  } catch (error) {
    console.error('Resim senkronizasyon hatası:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
  }
}