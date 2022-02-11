const app = require('./src/app');
const sequelize = require('./src/config/database');

// sequelize.sync({ force: true }).then(() => {
//   app.listen(3000, () => {
//     console.log('app is running');
//   });
// });
sequelize.sync();

app.listen(3000, () => {
  console.log('app is running');
});
