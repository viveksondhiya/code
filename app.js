const express = require('express'); 
const router = require('./router/router');  

const app = express();
app.use(express.json());

// Use the router as middleware
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
