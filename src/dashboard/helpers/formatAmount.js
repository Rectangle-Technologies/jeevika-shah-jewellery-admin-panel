const dollarIndianLocale = Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatAmount = (amount) => {
  return dollarIndianLocale.format(amount);
};

export default formatAmount;
