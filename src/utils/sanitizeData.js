export function decodeUnicodeEscapes(val) {
  if (typeof val === 'string') {
    return val.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
  if (Array.isArray(val)) {
    return val.map(decodeUnicodeEscapes);
  }
  if (val !== null && typeof val === 'object') {
    const newVal = {};
    for (const key in val) {
      newVal[key] = decodeUnicodeEscapes(val[key]);
    }
    return newVal;
  }
  return val;
}
