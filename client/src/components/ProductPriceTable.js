import React, { useState, useEffect } from 'react';
import './ProductPriceTable.css';
import SearchBar from './SearchBar';

const ProductPriceTable = ({ productData }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (productData && productData["Sản phẩm"]) {
      setFilteredProducts(productData["Sản phẩm"]);
    }
  }, [productData]);

  const handleSearch = (term) => {
    const filtered = productData["Sản phẩm"].filter(product => 
      product.Dòng.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    if (!price || price === '') return 'N/A';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="product-price-table-container">
      <SearchBar data={productData["Sản phẩm"]} onSearch={handleSearch} />
      <div className="table-container">
        <table className="product-price-table">
          <thead>
            <tr>
              <th>Dòng</th>
              <th>Giá Base</th>
              <th>Giá hàng hư hỏng</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={index}>
                <td>{product["Dòng"]}</td>
                <td>{formatPrice(product["Giá Base"])}</td>
                <td>{formatPrice(product["Giá hàng hư hỏng"])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPriceTable;