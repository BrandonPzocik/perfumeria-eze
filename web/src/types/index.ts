export type Family =
  | "Amaderada"
  | "Floral"
  | "Cítrica"
  | "Oriental"
  | "Acuática"
  | "Especiada";

export type Gender = "Femenino" | "Masculino" | "Unisex";

export type PerfumeType = "EDT" | "EDP" | "Parfum" | "Elixir";

export type Tag = "nuevo" | "oferta" | "destacado" | "mas-vendido";

export interface ScentNotes {
  salida: string[];
  corazon: string[];
  fondo: string[];
}

export interface PerfumeImage {
  id: string;
  url: string;
  isMain: boolean;
}

export interface Perfume {
  id: string; // SKU, usado como identificador público
  internalCode?: string;
  name: string;
  brand: string;
  gender: Gender;
  family: Family;
  type: PerfumeType;
  size: string;
  description?: string;

  price: number;
  oldPrice?: number;
  cost?: number;

  stock: number;
  minStock: number;

  notas: ScentNotes;
  intensidad: 1 | 2 | 3 | 4 | 5;
  duracion: string;

  visible: boolean;
  destacado: boolean;
  oferta: boolean;
  nuevo: boolean;
  masVendido: boolean;
  tags: Tag[];

  images: PerfumeImage[];

  views: number;
  cartAdds: number;
  whatsappClicks: number;
  shares: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface CartLine {
  id: string;
  qty: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  storeName: string;
  storeNameAccent: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  accentColor: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  schedule: string;
  currency: string;
  showCurrency: boolean;
  darkModeDefault: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
