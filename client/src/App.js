import React, { useState, useEffect } from 'react';
import ProductPricing from './pages/ProductPricing';
import PriceInsert from './pages/PriceInsert';
import Sidebar from './components/Sidebar';
import fetchProductData from './fetchProductData';

// PrimeReact imports
import "primereact/resources/primereact.min.css";                  // core css
import "primeicons/primeicons.css";                                // icons
import "primereact/resources/themes/lara-light-indigo/theme.css";  // theme

import './App.css';

function App() {
  const [activePage, setActivePage] = useState('productPricing');
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProductData();
        setProductData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, []);

  const updateProductData = (newData) => {
    setProductData(newData);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error loading product data</h2>
        <p>{error}</p>
        <p>Please check the following:</p>
        <ul>
          <li>Ensure the server is running on http://localhost:3001</li>
          <li>Verify that the productData.json file exists in the server's data folder</li>
          <li>Check the server console for any error messages</li>
        </ul>
        <button className='mybutton' onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!productData) {
    return <div className="error">No product data available. Please check the server and try again.</div>;
  }

  return (
    <div className="App">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        {activePage === 'productPricing' ? (
          <ProductPricing productData={productData} />
        ) : (
          <PriceInsert productData={productData} updateProductData={updateProductData} />
        )}
      </div>
    </div>
  );
}

export default App;
