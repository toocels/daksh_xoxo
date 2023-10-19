const express = require('express');
const app = express();

const PORT = 80;
const ADDRESS = "localhost";

app.use(express.static('public'));

app.listen(PORT, ADDRESS, _ => {
    console.log("Server listening on " + ADDRESS + ':' + PORT);
});