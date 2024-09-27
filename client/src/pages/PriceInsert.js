import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import './PriceInsert.css';
import ProductPriceTable from '../components/ProductPriceTable';

const PriceInsert = ({ productData, updateProductData }) => {
  const [priceInput, setPriceInput] = useState('');
  const [parsedPrices, setParsedPrices] = useState([]);
  const [brandTiers, setBrandTiers] = useState(['', '', '']);
  const [warrantyValues, setWarrantyValues] = useState(['', '', '']);
  const [ngoaiHinhValues, setNgoaiHinhValues] = useState(['', '']);
  const [rtxBoxValue, setRtxBoxValue] = useState('');
  const [updatedProductData, setUpdatedProductData] = useState(productData);
  const toast = useRef(null);

  useEffect(() => {
    setUpdatedProductData(productData);
    if (productData) {
      setBrandTiers([
        productData.Brand["Brand tier 1"].toString(),
        productData.Brand["Brand tier 2"].toString(),
        productData.Brand["Brand tier 3"].toString()
      ]);
      setWarrantyValues([
        productData["Bảo hành"][">= 12 tháng"].toString(),
        productData["Bảo hành"]["< 12 tháng"].toString(),
        productData["Bảo hành"]["Hết"].toString()
      ]);
      setNgoaiHinhValues([
        productData["Ngoại hình"]["Mới, đẹp"].toString(),
        productData["Ngoại hình"]["Trung bình"].toString()
      ]);
      setRtxBoxValue(productData["Có box RTX 3060 trở lên"].toString());
    }
  }, [productData]);

  const handlePriceInputChange = (e) => {
    setPriceInput(e.target.value);
  };

  const handleBrandTierChange = (index, value) => {
    const newBrandTiers = [...brandTiers];
    newBrandTiers[index] = value;
    setBrandTiers(newBrandTiers);
  };

  const handleWarrantyChange = (index, value) => {
    const newWarrantyValues = [...warrantyValues];
    newWarrantyValues[index] = value;
    setWarrantyValues(newWarrantyValues);
  };

  const handleNgoaiHinhChange = (index, value) => {
    const newNgoaiHinhValues = [...ngoaiHinhValues];
    newNgoaiHinhValues[index] = value;
    setNgoaiHinhValues(newNgoaiHinhValues);
  };

  const handleRtxBoxChange = (value) => {
    setRtxBoxValue(value);
  };

  const parsePriceInput = () => {
    const lines = priceInput.split('\n');
    const parsed = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const dong = parts.slice(0, -2).join(' ');
        const giaBase = parts[parts.length - 2];
        const giaHuHong = parts[parts.length - 1];
        return { Dòng: dong, "Giá Base": giaBase, "Giá hàng hư hỏng": giaHuHong };
      }
      return null;
    }).filter(item => item !== null);
    setParsedPrices(parsed);
    return parsed;
  };

  const updateAllData = async () => {
    try {
      const newProductData = { ...updatedProductData };
      
      // Update timestamp
      newProductData.timestamp = new Date().toISOString();
      
      // Update version (assuming semantic versioning)
      const currentVersion = newProductData.version.split('.');
      currentVersion[2] = (parseInt(currentVersion[2]) + 1).toString();
      newProductData.version = currentVersion.join('.');

      // Update "Sản phẩm" array
      newProductData["Sản phẩm"] = newProductData["Sản phẩm"].map(product => ({
        ...product,
        "Giá Base": product["Giá Base"].toString(),
        "Giá hàng hư hỏng": product["Giá hàng hư hỏng"].toString()
      }));

      // Parse price input if it hasn't been parsed yet
      const pricesToUpdate = parsedPrices.length > 0 ? parsedPrices : parsePriceInput();

      pricesToUpdate.forEach(item => {
        const existingIndex = newProductData["Sản phẩm"].findIndex(p => p.Dòng === item.Dòng);
        if (existingIndex !== -1) {
          // Update existing product
          newProductData["Sản phẩm"][existingIndex] = {
            ...newProductData["Sản phẩm"][existingIndex],
            ...item,
            "Giá Base": item["Giá Base"].toString(),
            "Giá hàng hư hỏng": item["Giá hàng hư hỏng"].toString()
          };
        } else {
          // Add new product
          newProductData["Sản phẩm"].push({
            ...item,
            "Giá Base": item["Giá Base"].toString(),
            "Giá hàng hư hỏng": item["Giá hàng hư hỏng"].toString()
          });
        }
      });

      // Update brand tiers
      newProductData["Brand"] = {
        "Brand tier 1": brandTiers[0] || newProductData["Brand"]["Brand tier 1"],
        "Brand tier 2": brandTiers[1] || newProductData["Brand"]["Brand tier 2"],
        "Brand tier 3": brandTiers[2] || newProductData["Brand"]["Brand tier 3"]
      };

      // Update warranty values
      newProductData["Bảo hành"] = {
        ">= 12 tháng": warrantyValues[0] || newProductData["Bảo hành"][">= 12 tháng"],
        "< 12 tháng": warrantyValues[1] || newProductData["Bảo hành"]["< 12 tháng"],
        "Hết": warrantyValues[2] || newProductData["Bảo hành"]["Hết"]
      };

      // Update Ngoại hình values
      newProductData["Ngoại hình"] = {
        "Mới, đẹp": ngoaiHinhValues[0] || newProductData["Ngoại hình"]["Mới, đẹp"],
        "Trung bình": ngoaiHinhValues[1] || newProductData["Ngoại hình"]["Trung bình"]
      };

      // Update RTX Box value
      newProductData["Có box RTX 3060 trở lên"] = rtxBoxValue || newProductData["Có box RTX 3060 trở lên"];

      // Send updated data to backend API
      const response = await fetch('http://localhost:3001/api/updateProductData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProductData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product data');
      }

      const result = await response.json();

      // Update the state with new product data
      setUpdatedProductData(newProductData);
      updateProductData(newProductData);

      console.log("Updated product data:", newProductData);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: `${result.message}\nNew version: ${newProductData.version}\nTimestamp: ${newProductData.timestamp}`,
        life: 5000
      });
      
      // Clear all input fields
      setPriceInput('');
      setParsedPrices([]);
      setBrandTiers(['', '', '']);
      setWarrantyValues(['', '', '']);
      setNgoaiHinhValues(['', '']);
      setRtxBoxValue('');
    } catch (error) {
      console.error("Error updating product data:", error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while updating product data. Please try again.',
        life: 5000
      });
    }
  };

  const confirmUpdate = () => {
    confirmDialog({
      message: 'Are you sure you want to update the product data?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => updateAllData(),
      reject: () => toast.current.show({severity:'info', summary:'Cancelled', detail:'Update cancelled', life: 3000})
    });
  };

  if (!productData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="price-insert">
      <Toast ref={toast} className="custom-toast"/>
      <ConfirmDialog />
      <div className="price-insert-header">
        <h2>Nhập giá sản phẩm</h2>
        <div className="product-data-info">
          <p>Version: {productData.version}</p>
          <p>Last Updated: {new Date(productData.timestamp).toLocaleString()}</p>
        </div>
      </div>
      <div className="price-insert-content">
        <ProductPriceTable productData={updatedProductData} />
        <div className="price-input-section">
          <div className="form-group">
            <h3>Bảng giá</h3>
            <textarea
              value={priceInput}
              onChange={handlePriceInputChange}
              placeholder="Nhập theo cú pháp dòng sản phẩm <khoảng trắng> giá base <khoảng trắng> giá hư hỏng (ví dụ: GTX750Ti 500 280)"
              rows={8}
            />
            <button onClick={parsePriceInput} className="mybutton action-button btn1">Xem trước</button>
          </div>
          {parsedPrices.length > 0 && (
            <div className="parsed-prices form-group">
              <div className="table-container">
                <table className="parsed-prices-table">
                  <thead>
                    <tr>
                      <th>Dòng</th>
                      <th>Giá Base</th>
                      <th>Giá hàng hư hỏng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPrices.map((item, index) => (
                      <tr key={index}>
                        <td>{item.Dòng}</td>
                        <td>{item["Giá Base"]}</td>
                        <td>{item["Giá hàng hư hỏng"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="form-group">
            <table className="brand-table">
              <caption>Brand</caption>
              <thead>
                <tr>
                  <th>Brand tier 1</th>
                  <th>Brand tier 2</th>
                  <th>Brand tier 3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {brandTiers.map((tier, index) => (
                    <td key={index}>
                      <input
                        type="number"
                        step="0.01"
                        value={tier}
                        onChange={(e) => handleBrandTierChange(index, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="form-group">
            <table className="warranty-table">
              <caption>Bảo hành</caption>
              <thead>
                <tr>
                  <th>{">= 12 tháng"}</th>
                  <th>{"< 12 tháng"}</th>
                  <th>Hết</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {warrantyValues.map((value, index) => (
                    <td key={index}>
                      <input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleWarrantyChange(index, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="form-group">
            <table className="ngoai-hinh-table">
              <caption>Ngoại hình</caption>
              <thead>
                <tr>
                  <th>Mới, đẹp</th>
                  <th>Trung bình</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {ngoaiHinhValues.map((value, index) => (
                    <td key={index}>
                      <input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleNgoaiHinhChange(index, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="form-group box-group">
            <h3>Có box RTX 3060 trở lên</h3>
            <input
              type="number"
              value={rtxBoxValue}
              onChange={(e) => handleRtxBoxChange(e.target.value)}
            />
          </div>
          <button onClick={confirmUpdate} className="mybutton action-button btn2">Cập nhật</button>
        </div>
      </div>
    </div>
  );
};

export default PriceInsert;