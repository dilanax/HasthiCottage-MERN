// Currency conversion utilities
// Exchange rate: 1 USD = 330 LKR (approximate current rate)

export const LKR_TO_USD_RATE = 330;

// Convert LKR to USD
export const convertLKRToUSD = (lkrAmount) => {
  return Number(lkrAmount) / LKR_TO_USD_RATE;
};

// Format USD currency
export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount));
};

// Format LKR currency (for reference)
export const formatLKR = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(amount));
};

// Convert and format LKR to USD
export const convertAndFormatLKRToUSD = (lkrAmount) => {
  const usdAmount = convertLKRToUSD(lkrAmount);
  return formatUSD(usdAmount);
};

// Display both currencies (USD primary, LKR secondary)
export const displayDualCurrency = (lkrAmount) => {
  const usdAmount = convertLKRToUSD(lkrAmount);
  return {
    primary: formatUSD(usdAmount),
    secondary: formatLKR(lkrAmount),
    usdValue: usdAmount,
    lkrValue: Number(lkrAmount)
  };
};
