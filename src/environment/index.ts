export const environment = {
  production: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT,
  API_KEY: process.env.API_KEY,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAILGUN_DOMAIN: 'revolutionuc.com',
  CRYPTO_KEY: process.env.CRYPTO_KEY,
  WAITLIST_THRESHOLD: parseInt(process.env.WAITLIST_THRESHOLD) || 9999,
  CURRENT_INFO_EMAIL: process.env.CURRENT_INFO_EMAIL || 'infoEmail1',
  database_config: {
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: true,
  },
};
