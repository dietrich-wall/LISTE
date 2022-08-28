//connect to DB
require("./backend/config/db")();

// setup server
const app = require("./backend/config/server");

// listen to Server requests at provided Port
const { PORT, HOST_URL } = process.env;
app.listen(PORT, () => {
  console.log(`Server started on ${HOST_URL}`);
});
