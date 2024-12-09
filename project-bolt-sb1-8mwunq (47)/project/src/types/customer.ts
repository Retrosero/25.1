export interface Customer {
  id: string;                  // cari_kod
  name: string;                // cari_unvan1
  name2: string;               // cari_unvan2
  taxNumber: string;           // cari_vdaire_no
  email: string;               // cari_EMail
  phone: string;               // cari_CepTel
  createDate: string;          // cari_create_date
  updateDate: string;          // cari_lastup_date
  transactionType: number;     // cari_hareket_tipi
  connectionType: number;      // cari_baglanti_tipi
  taxOffice: string;          // cari_vdaire_adi
  registrationNumber: string;  // cari_sicil_no
  taxId: string;              // cari_VergiKimlikNo
  region?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
}