import { DBSchema } from 'idb';

export interface MikroDB extends DBSchema {
  CARI_HESAPLAR: {
    key: string;
    value: {
      cari_kod: string;
      cari_unvan1: string;
      cari_unvan2: string;
      cari_vdaire_no: string;
      cari_EMail: string;
      cari_CepTel: string;
      cari_create_date: string;
      cari_lastup_date: string;
      cari_hareket_tipi: number;
      cari_baglanti_tipi: number;
      cari_vdaire_adi: string;
      cari_sicil_no: string;
      cari_VergiKimlikNo: string;
    };
    indexes: {
      'by-lastup': string;
      'by-unvan': string;
      'by-kod': string;
    };
  };
  CARI_HESAP_ADRESLERI: {
    key: string;
    value: {
      adr_create_date: string;
      adr_lastup_date: string;
      adr_cari_kod: string;
      adr_cadde: string;
      adr_mahalle: string;
      adr_sokak: string;
      adr_Semt: string;
      adr_Apt_No: string;
      adr_Daire_No: string;
      adr_posta_kodu: string;
      adr_ilce: string;
      adr_il: string;
    };
    indexes: {
      'by-lastup': string;
      'by-cari-kod': string;
    };
  };
  CARI_HESAP_YETKILILERI: {
    key: string;
    value: {
      yet_cari_kod: string;
      yet_adi: string;
      yet_soyadi: string;
      yet_gorevi: string;
      yet_tel: string;
      yet_GSM: string;
      yet_EMail: string;
      yet_create_date: string;
      yet_lastup_date: string;
    };
    indexes: {
      'by-lastup': string;
      'by-cari-kod': string;
    };
  };
  BARKOD_TANIMLARI: {
    key: string;
    value: {
      bar_create_date: string;
      bar_lastup_date: string;
      bar_special1: string;
      bar_special2: string;
      bar_special3: string;
      bar_kodu: string;
      bar_stokkodu: string;
    };
    indexes: {
      'by-lastup': string;
      'by-stokkodu': string;
      'by-barkod': string;
    };
  };
  CARI_HESAP_HAREKETLERI: {
    key: string;
    value: {
      cha_create_date: string;
      cha_lastup_date: string;
      cha_evrak_tip: number;
      cha_evrakno_seri: string;
      cha_evrakno_sira: number;
      cha_tip: number;
      cha_cinsi: number;
      cha_normal_iade: number;
      cha_aciklama: string;
      cha_cari_cins: number;
      cha_kod: string;
      cha_ciro_cari_kodu: string;
      cha_meblag: number;
    };
    indexes: {
      'by-lastup': string;
      'by-kod': string;
    };
  };
  sync_status: {
    key: string;
    value: {
      table_name: string;
      last_sync: string;
    };
  };
}