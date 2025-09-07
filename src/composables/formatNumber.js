export function formatNumber(number) {
  const formatted = Math.abs(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return number < 0 ? `${formatted}-` : formatted
}
