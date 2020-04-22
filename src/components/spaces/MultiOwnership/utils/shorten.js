export const shorten = (address, start = 10, end = 40) => ({
  short: address.replace(address.slice(start, end), '...'),
  address
});
