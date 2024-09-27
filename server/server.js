const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const productDataPath = path.join(__dirname, 'data', 'productData.json');

app.get('/api/getProductData', (req, res) => {
  fs.readFile(productDataPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'Product data file not found' });
      }
      return res.status(500).json({ message: 'Error fetching product data', error: err.message });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing product data', error: parseError.message });
    }
  });
});

app.post('/api/updateProductData', (req, res) => {
  const newData = req.body;

  fs.writeFile(productDataPath, JSON.stringify(newData, null, 2), (err) => {
    if (err) {
      res.status(500).json({ message: 'Error updating product data', error: err.message });
    } else {
      res.json({ message: 'Product data updated successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Product data path: ${productDataPath}`);
});