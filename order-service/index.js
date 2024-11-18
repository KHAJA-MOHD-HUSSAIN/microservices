const express = require('express');
const app = express();

app.get('/orders', (req, res) => {
    res.json([{ id: 1, item: "Book" }, { id: 2, item: "Laptop" }]);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));

