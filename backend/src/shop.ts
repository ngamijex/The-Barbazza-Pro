/** Google Business defaults for The Barbazza Barbershop (Kigali). */
export const SHOP_DEFAULTS = {
  shop_name: "The Barbazza",
  shop_address: "186 KK 31 Ave, Ubutare, Kigali, Rwanda",
  shop_phone: "+250 791 345 455",
  shop_email: "",
  shop_maps_url: "https://maps.google.com/?q=-1.974001,30.076725",
  shop_whatsapp: "https://wa.me/250791345455",
} as const;

export function digitsPhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  // Local Rwanda mobiles (07xxxxxxxx) → international 2507xxxxxxxx
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `250${digits.slice(1)}`;
  }
  return digits;
}

export function whatsappUrl(phone: string) {
  const digits = digitsPhone(phone);
  return digits ? `https://wa.me/${digits}` : "";
}
