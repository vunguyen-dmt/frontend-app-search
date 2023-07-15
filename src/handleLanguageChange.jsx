import React from 'react';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';

export const setCookie = (name, value, days, domain) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/;domain=${domain}`;
};

export function getCookie(cookieName) {
  const cookies = new Cookies();
  return cookies.get(cookieName);
}

export const getCurrentLanguageCode = () => getCookie(getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME) || 'en';
const getLMSDomain = () => `.${getConfig().LMS_BASE_URL.replace('https://', '')}`;

export const handleLanguageChange = (value) => {
  setCookie(getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME, value, 30, getLMSDomain());
  window.location.reload();
};
