import { XMLParser } from 'fast-xml-parser';
import { initProductDB } from './db/product';

export async function fetchProductImages(xmlUrl: string, productCode: string) {
  try {
    const response = await fetch(xmlUrl);
    if (!response.ok) {
      throw new Error('XML verisi alınamadı');
    }
    
    const xmlText = await response.text();
    
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
  } catch (error) {
    console.error('XML okuma hatası:', error);
    return [];
  }
}

export async function syncProductImages(xmlUrl: string) {
  try {
    const response = await fetch(xmlUrl);
    if (!response.ok) {
      throw new Error('XML verisi alınamadı');
    }
    
    const xmlText = await response.text();
    
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

    // IndexedDB'yi aç
    const db = await initProductDB();
    const tx = db.transaction('products', 'readwrite');
    const store = tx.store;

    // Her ürün için resim URL'lerini güncelle
    for (const xmlProduct of products) {
      const productCode = xmlProduct.Product_code?.toString().trim();
      if (!productCode) continue;

      const product = await store.get(productCode);
      if (!product) continue;

      const images = [];
      for (let i = 1; i <= 10; i++) {
        const imageUrl = xmlProduct[`Image${i}`];
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
          images.push({
            id: `${productCode}-img-${i}`,
            url: imageUrl.trim(),
            order: i - 1
          });
        }
      }

      // Ürünü güncelle
      product.images = images;
      await store.put(product);
    }

    await tx.done;
    return { success: true, message: 'Ürün resimleri başarıyla güncellendi' };

  } catch (error) {
    console.error('XML okuma hatası:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
  }
}