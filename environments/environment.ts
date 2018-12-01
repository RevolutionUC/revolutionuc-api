export const environment = {
  production: process.env.production === 'true',
  API_KEY: process.env.API_KEY,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAILGUN_DOMAIN: 'revolutionuc.com',
  CRYPTO_KEY: process.env.CRYPTO_KEY,
  database_config: {
    url: process.env.DATABASE_URL,
    database: 'revuc',
    synchronize: true,
    logging: true
  },
};