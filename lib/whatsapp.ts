export const generateWALink = (phone: string, vehicleTitle: string, vehiclePrice: number) => {
  // Ensure phone format is 628xxx
  // Remove non-numeric characters first just in case
  const cleanPhone = phone.replace(/\D/g, '');

  let formattedPhone = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    formattedPhone = '62' + cleanPhone.slice(1);
  }

  // Format price to currency string for better readability in the message
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(vehiclePrice);

  const message = `Halo, saya tertarik dengan mobil ${vehicleTitle} seharga ${formattedPrice} yang ada di marketplace Anda. Apakah masih tersedia?`;
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};
