// Format price as whole number (no decimals)
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0';
  }
  return Math.round(Number(price)).toLocaleString('en-IN');
};

// Format price with currency symbol
export const formatPriceWithCurrency = (price, currency = '₹') => {
  return `${currency}${formatPrice(price)}`;
};

