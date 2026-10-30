export type PublicShop = {
  name: string;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  whatsappUrl: string;
};

/** Google Business fallbacks used until /api/public/shop responds. */
export const SHOP_FALLBACK: PublicShop = {
  name: "The Barbazza",
  address: "186 KK 31 Ave, Ubutare, Kigali, Rwanda",
  phone: "+250 791 345 455",
  email: "",
  mapsUrl: "https://maps.google.com/?q=-1.974001,30.076725",
  whatsappUrl: "https://wa.me/250791345455",
};

export function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}
