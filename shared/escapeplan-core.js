(function (global) {
  'use strict';

  const currencyConfig = {
    IN: { currency: 'INR', locale: 'en-IN' },
    AE: { currency: 'AED', locale: 'en-AE' },
    US: { currency: 'USD', locale: 'en-US' }
  };

  function formatCurrency(value, market = 'IN', options = {}) {
    const config = currencyConfig[market] || currencyConfig.IN;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0,
      ...options
    }).format(value);
  }

  global.EscapePlanCore = Object.freeze({ currencyConfig, formatCurrency });
}(window));
