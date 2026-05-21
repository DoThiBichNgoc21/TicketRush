export const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  document.cookie = `${name}=${encodeURIComponent(stringValue)}; expires=${expires}; path=/`;
};

export const getCookie = (name) => {
  const value = document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
  
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

export const removeCookie = (name) => {
  setCookie(name, '', -1);
};
