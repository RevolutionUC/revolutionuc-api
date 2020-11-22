export const environment = {
  production: process.env.production === 'true',
  PORT: process.env.PORT,
  API_KEY: process.env.API_KEY,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAILGUN_DOMAIN: 'revolutionuc.com',
  CRYPTO_KEY: process.env.CRYPTO_KEY,
  WAITLIST_THRESHOLD: parseInt(process.env.WAITLIST_THRESHOLD),
  database_config: {
    url: process.env.DATABASE_URL,
    synchronize: process.env.production !== 'true',
    logging: true,
  },
};
