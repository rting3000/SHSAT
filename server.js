const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve all static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Your new SHSAT Prep Dashboard is now live.');
}); 