// Generic function for returning given page with size from
// an array of objects.
const queryArray = (array, page, size) => {
  const results = [];

  const startIndex = (page - 1) * size;
  if (startIndex >= array.length) return results;

  let endIndex = page * size;
  for (let i = 0; i < array.length && i < endIndex; i++) {
    if (i >= startIndex) results.push(array[i]);
  }

  return {
    page,
    size,
    total: array.length,
    results,
  };
};

module.exports = {
  queryArray,
};
