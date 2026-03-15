function addToDate(d, { days = 0, months = 0, years = 0 }) {
  const date = d;
  date.setFullYear(date.getFullYear() + years);
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + days);

  return date;
}

module.exports = { addToDate };
