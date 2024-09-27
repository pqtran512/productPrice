import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Product Price Manager</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li
            className={activePage === 'productPricing' ? 'active' : ''}
            onClick={() => setActivePage('productPricing')}
          >
            Định giá sản phẩm
          </li>
          <li
            className={activePage === 'priceInsert' ? 'active' : ''}
            onClick={() => setActivePage('priceInsert')}
          >
            Nhập giá sản phẩm
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;