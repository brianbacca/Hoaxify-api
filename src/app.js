const express = require('express');
const UserRouter = require('./user/User.router.js');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

const cors = require('cors');
const app = express();
app.use(middleware.handle(i18next));
app.use(express.json());
app.use(cors());
app.use(UserRouter);

module.exports = app;
