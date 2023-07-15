const removeLastChar = (str, c) => {
  if (!str) {
    return str;
  }
  let maxDept = 10;
  while (str && str.endsWith(c) && maxDept > 0) {
    str = str.substr(0, str.length - 1);
    maxDept--;
  }
  return str;
};
// eslint-disable-next-line import/prefer-default-export
export const updateQueryStringParameter = (uri, key, value) => {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    if (value) {
      const result = uri.replace(re, `$1${key}=${encodeURIComponent(value)}$2`);
      return result;
    }
    return removeLastChar(uri.replace(re, '$1$2'), '&');
  }
  if (value) {
    return `${uri + separator + key}=${encodeURIComponent(value)}`;
  }
  return `${uri}`;
};
