import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import brandTierData from '../data/brand-tier.json'
import './ProductPricing.css';
import SearchBar from '../components/SearchBar';
import SelectInput from '../components/SelectInput';
import RadioButton from '../components/RadioButton';

const ProductPricing = ({ productData }) => {
  const [condition, setCondition] = useState('Bình thường');
  const [brand, setBrand] = useState('');
  const [warranty, setWarranty] = useState('>= 12 tháng');
  const [appearance, setAppearance] = useState('Mới, đẹp');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bill, setBill] = useState([]);
  const toast = useRef(null);

  useEffect(() => {
    if (productData && productData["Sản phẩm"]) {
      setProducts(productData["Sản phẩm"]);
      setFilteredProducts(productData["Sản phẩm"]);
      setSelectedProduct(productData["Sản phẩm"][0]);
    }
  }, [productData]);

  const brandOptions = [
    { value: '', label: 'Select a brand' },
    { value: 'Asus', label: 'Asus' },
    { value: 'Gigabyte', label: 'Gigabyte' },
    { value: 'MSI', label: 'MSI' },
    { value: 'Colourful', label: 'Colourful' },
    { value: 'Asrock', label: 'Asrock' },
    { value: 'Inno3D', label: 'Inno3D' },
    { value: 'PNY', label: 'PNY' },
    { value: 'Zotac', label: 'Zotac' },
    { value: 'Galax', label: 'Galax' },
    { value: 'Gainward', label: 'Gainward' },
    { value: 'Manli', label: 'Manli' },
    { value: 'Palit', label: 'Palit' },
    { value: 'ASL', label: 'ASL' }
  ];

  const handleSearch = (term) => {
    const filtered = products.filter(product => 
      product.Dòng.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    if (filteredProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(filteredProducts[0]);
    }
  }, [filteredProducts, selectedProduct]);

  const handleRowClick = (product) => {
    setSelectedProduct(product);
  };

  const formatPrice = (price) => {
    if (!price || price === '') return 'N/A';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const showPrice = (product, condition) => {
      switch (condition) {
        case 'Bình thường':
          return product['Giá Base'];
        case 'Hư, còn xuất hình':
          let price = product['Giá hàng hư hỏng']
          let p = price ? (parseInt(price.replace(/[\s,]/g, ''), 10) + 100).toString() : '';
          return formatPrice(p)
        case 'Không hoạt động':
          return product['Giá hàng hư hỏng'];
        default:
          return '';
      }
  }

  const getBrandTier = (brand) => {
    for (const [tier, brands] of Object.entries(brandTierData)) {
      if (brands.includes(brand)) {
        return tier;
      }
    }
    return null;
  }

  const isRTX3060OrHigher = (dong) => {
    const rtxRegex = /RTX\s*(\d{4})/i;
    const match = dong.match(rtxRegex);
    if (match) {
      const modelNumber = parseInt(match[1]);
      return modelNumber >= 3060;
    }
    return false;
  }

  const calculateTotal = (billItems) => {
    if (condition !== 'Bình thường') {
      // If condition is not "Bình thường", return only the basePrice
      return parseInt(billItems[0].gia.replace(/,/g, ''), 10);
    }

    let total = 0;
    let basePrice = 0;

    billItems.forEach((item, index) => {
      if (index === 0) {
        basePrice = parseInt(item.gia.replace(/,/g, ''), 10);
        total = basePrice;
      } else if (item.gia.includes('%')) {
        const percentage = parseFloat(item.gia.replace(/[+%]/g, '')) / 100;
        total += basePrice * percentage;
      } else {
        total += 50000;
      }
    });

    return Math.round(total);
  };

  const handleDinhGia = () => {
    const missingFields = [];

    if (!condition) missingFields.push("Tình trạng");
    if (!selectedProduct) missingFields.push("Sản phẩm");

    if (condition === 'Bình thường') {
      if (!brand) missingFields.push("Brand");
      if (!warranty) missingFields.push("Bảo hành");
      if (!appearance) missingFields.push("Ngoại hình");
    }

    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(", ");
      toast.current.show({
        severity: 'error',
        summary: 'Missing Information',
        detail: `Bạn chưa chọn thông tin: ${missingFieldsString}`,
        life: 5000
      });
      return;
    }

    if (selectedProduct && condition) {
      console.log(selectedProduct)
      const p = showPrice(selectedProduct, condition)
      const billItems = [
        {
          muc: `Giá ${condition}`,
          gia: `${p === ''? 'N/A' : `${p},000`}`
        }
      ];

      if (condition === 'Bình thường') {
        const brandTier = getBrandTier(brand);
        const brandTierValue = productData.Brand[`Brand ${brandTier.toLowerCase()}`];
        const warrantyValue = productData["Bảo hành"][warranty];
        const appearanceValue = productData["Ngoại hình"][appearance];

        billItems.push(
          {
            muc: `Brand ${brandTier.toLowerCase()}`,
            gia: '+ ' + ((brandTierValue - 1) * 100).toFixed(0) + '%'
          },
          {
            muc: `Bảo hành ${warranty.toLowerCase()}`,
            gia: '+ ' + ((warrantyValue - 1) * 100).toFixed(0) + '%'
          },
          {
            muc: `Ngoại hình ${appearance.toLowerCase()}`,
            gia: '+ ' + ((appearanceValue - 1) * 100).toFixed(0) + '%'
          }
        );

        if (isRTX3060OrHigher(selectedProduct['Dòng'])) {
          billItems.push({
            muc: `Có box ${selectedProduct['Dòng']}`,
            gia: '+ 50,000'
          });
        }
      }

      setBill(billItems);
    }
  };

  if (!productData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-pricing">
      <Toast ref={toast} className="custom-toast"/>
      <div className="product-pricing-header">
        <h2>Định giá sản phẩm</h2>
        <div className="product-data-info">
          <p>Version: {productData.version}</p>
          <p>Last Updated: {new Date(productData.timestamp).toLocaleString()}</p>
        </div>
      </div>
      <div className="product-pricing-content">
        <div className="product-list">
          <SearchBar data={products} onSearch={handleSearch} />
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dòng</th>
                  <th>Giá</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr 
                    key={index} 
                    onClick={() => handleRowClick(product)}
                    className={selectedProduct && selectedProduct.Dòng === product.Dòng ? 'selected-row' : ''}
                  >
                    <td>{product.Dòng}</td>
                    <td>{showPrice(product, condition)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="product-details">
          {selectedProduct && (
            <div className="selected-product-info">
              <label htmlFor="selected-dong">Dòng</label>
              <input 
                id="selected-dong"
                type="text" 
                value={selectedProduct.Dòng} 
                disabled 
                required
              />
            </div>
          )}
          <div className="form-group">
            <h3>Tình trạng</h3>
            <div className="radio-group">
              <RadioButton
                label="Bình thường"
                value="Bình thường"
                checked={condition === 'Bình thường'}
                onChange={(e) => setCondition(e.target.value)}
              />
              <RadioButton
                label="Hư, còn xuất hình"
                value="Hư, còn xuất hình"
                checked={condition === 'Hư, còn xuất hình'}
                onChange={(e) => setCondition(e.target.value)}
              />
              <RadioButton
                label="Không hoạt động"
                value="Không hoạt động"
                checked={condition === 'Không hoạt động'}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
          </div>
          <div style={{ visibility: condition !== 'Bình thường' ? 'hidden' : 'visible' }}>
            <div className="form-group">
              <h3>Bảo hành</h3>
              <div className="radio-group">
                <RadioButton
                  label=">= 12 tháng"
                  value=">= 12 tháng"
                  checked={warranty === '>= 12 tháng'}
                  onChange={(e) => setWarranty(e.target.value)}
                />
                <RadioButton
                  label="< 12 tháng"
                  value="< 12 tháng"
                  checked={warranty === '< 12 tháng'}
                  onChange={(e) => setWarranty(e.target.value)}
                />
                <RadioButton
                  label="Hết"
                  value="Hết"
                  checked={warranty === 'Hết'}
                  onChange={(e) => setWarranty(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <h3>Ngoại hình</h3>
              <div className="radio-group">
                <RadioButton
                  label="Mới, đẹp"
                  value="Mới, đẹp"
                  checked={appearance === 'Mới, đẹp'}
                  onChange={(e) => setAppearance(e.target.value)}
                />
                <RadioButton
                  label="Trung bình"
                  value="Trung bình"
                  checked={appearance === 'Trung bình'}
                  onChange={(e) => setAppearance(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <SelectInput
                label="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                options={brandOptions}
              />
            </div>
          </div>
          <button onClick={handleDinhGia} className="mybutton dinh-gia-button">Định giá</button>
        </div>
      </div>
      {bill?.length > 0 && (
        <div className="bill">
          <h3>Tổng trị giá sản phẩm</h3>
          <table>
            <thead>
              <tr>
                <th>Mục</th>
                <th>Giá (vnd)</th>
              </tr>
            </thead>
            <tbody>
              {bill.map((item, index) => (
                <tr key={index}>
                  <td>{item.muc}</td>
                  <td>{item.gia}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Tổng</strong></td>
                <td>{formatPrice(calculateTotal(bill))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductPricing;