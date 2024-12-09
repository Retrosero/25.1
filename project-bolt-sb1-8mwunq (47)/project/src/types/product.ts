export interface Product {
  sto_kod: string;
  sto_isim: string;
  sto_kisa_ismi: string;
  sto_yer_kod: string;
  sto_sektor_kodu: string;
  sto_ambalaj_kodu: string;
  sto_marka_kodu: string;
  sto_create_date: string;
  sto_lastup_date: string;
  bar_kodu?: string;
  sth_eldeki_miktar?: number;
  sfiyat_fiyati?: number;
}