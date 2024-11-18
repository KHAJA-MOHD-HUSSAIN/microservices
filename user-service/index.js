const express = require('express');
const app = express();

app.get('/users', (req, res) => {
    res.json([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));


