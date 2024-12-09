import { Customer } from '../types/customer';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  try {
    const url = new URL(`${API_BASE_URL}/cari-hesap`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Müşteriler yüklenirken bir hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  try {
    const response = await fetch(`${API_BASE_URL}/cari-hesap/${id}`);
    if (!response.ok) {
      throw new Error('Müşteri bilgileri yüklenirken bir hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function fetchCustomerBalance(id: string): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/cari-hesap/${id}/balance`);
    if (!response.ok) {
      throw new Error('Müşteri bakiyesi yüklenirken bir hata oluştu');
    }

    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function fetchProducts(search?: string): Promise<Product[]> {
  try {
    const url = new URL(`${API_BASE_URL}/stok`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Ürünler yüklenirken bir hata oluştu');
    }

    const products = await response.json();
    
    const productsWithDetails = [];
    
    for (const product of products) {
      try {
        const encodedStokKod = encodeURIComponent(product.sto_kod.trim());
        
        // Barkod bilgisi
        const barkodResponse = await fetch(`${API_BASE_URL}/barkod/${encodedStokKod}`);
        if (!barkodResponse.ok) {
          throw new Error('Barkod bilgisi alınamadı');
        }
        const barkodData = await barkodResponse.json();
        
        // Stok miktarı
        const stokResponse = await fetch(`${API_BASE_URL}/stok-eldeki-miktar/${encodedStokKod}`);
        if (!stokResponse.ok) {
          throw new Error('Stok miktarı alınamadı');
        }
        const stokData = await stokResponse.json();
        
        // Fiyat bilgisi
        const fiyatResponse = await fetch(`${API_BASE_URL}/stok-fiyat/${encodedStokKod}`);
        if (!fiyatResponse.ok) {
          throw new Error('Fiyat bilgisi alınamadı');
        }
        const fiyatData = await fiyatResponse.json();
        
        productsWithDetails.push({
          ...product,
          bar_kodu: barkodData[0]?.bar_kodu || '',
          sth_eldeki_miktar: stokData?.sth_eldeki_miktar || 0,
          sfiyat_fiyati: fiyatData?.find((f: any) => f.sfiyat_listesirano === 1)?.sfiyat_fiyati || 0,
          sfiyat_fiyati_2: fiyatData?.find((f: any) => f.sfiyat_listesirano === 2)?.sfiyat_fiyati || 0,
          sfiyat_fiyati_3: fiyatData?.find((f: any) => f.sfiyat_listesirano === 3)?.sfiyat_fiyati || 0
        });
      } catch (error) {
        console.error(`Ürün detayları alınırken hata (${product.sto_kod}):`, error);
        productsWithDetails.push({
          ...product,
          bar_kodu: '',
          sth_eldeki_miktar: 0,
          sfiyat_fiyati: 0,
          sfiyat_fiyati_2: 0,
          sfiyat_fiyati_3: 0
        });
      }
    }

    return productsWithDetails;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function fetchCustomerTransactions(id: string, year: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/cari-hareket/${id}`);
    if (!response.ok) {
      throw new Error('Müşteri işlemleri yüklenirken bir hata oluştu');
    }

    const transactions = await response.json();
    
    return transactions.map((transaction: any) => {
      const { cha_evrak_tip, cha_cinsi, cha_normal_Iade, cha_tip } = transaction;

      let transactionTypeName = 'Bilinmeyen İşlem';

      // Koşullar (sıra önemlidir, en belirleyici koşulları üste yazıyoruz)
      if (cha_evrak_tip === 1) {
        transactionTypeName = 'Tahsilat';
      } else if (cha_evrak_tip === 64 && (cha_cinsi === 0 || cha_cinsi === 3 || cha_cinsi === 1 || cha_cinsi === 20 || cha_cinsi === 4|| cha_cinsi === 2)) {
        transactionTypeName = 'Tediye';
      } else if (cha_evrak_tip === 63 && cha_normal_Iade === 0) {
        transactionTypeName = 'Satış';
      } else if (cha_evrak_tip === 63 && cha_normal_Iade === 1) {
        // İade durumunda cha_tip SATIŞ mı ALIŞ mı ayrımı
        if (cha_tip === 1) {
          transactionTypeName = 'Satış İade';
        } else {
          transactionTypeName = 'Alış İade';
        }
      } else if (cha_evrak_tip === 0) {
        transactionTypeName = 'Alış';
      } else if (cha_evrak_tip === 29 && cha_tip === 0 && cha_cinsi === 16) {
        transactionTypeName = 'Açılış Fişi Borç';
      } else if (cha_evrak_tip === 29 && cha_tip === 1 && cha_cinsi === 16) {
        transactionTypeName = 'Açılış Fişi Alacak';
      }

      return {
        id: transaction.cha_evrakno_seri + transaction.cha_evrakno_sira,
        date: transaction.cha_create_date,
        type: transactionTypeName,
        description: transaction.cha_aciklama,
        amount: transaction.cha_meblag,
        series: transaction.cha_evrakno_seri,
        sequence: transaction.cha_evrakno_sira
      };
    });
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export async function fetchProductsUpdatedAfter(lastSyncDate: string) {
  try {
    const url = new URL(`${API_BASE_URL}/stok/sync`);
    url.searchParams.append('after', lastSyncDate);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Güncel ürünler alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
