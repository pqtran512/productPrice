import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './SearchBar.css';

const SearchBar = ({ data, onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const uniqueDongs = [...new Set(data.map(item => item.Dòng))].sort();
    setFilteredOptions(uniqueDongs);
  }, [data]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = [...new Set(data.map(item => item.Dòng))]
      .filter(dong => dong.toLowerCase().includes(value.toLowerCase()))
      .sort();
    setFilteredOptions(filtered);
    setIsOpen(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchTerm);
      setIsOpen(false);
    }
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option);
    setIsOpen(false);
    onSearch(option);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
    setIsOpen(false);
  };

  return (
    <div className="search-bar-container" ref={wrapperRef}>
      <span className="p-input-icon-right">
        <InputText
          type="text"
          className="search-input"
          placeholder="Search by Dòng"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
        />
        <i className="pi pi-search search-icon" onClick={handleSearch}></i>
      </span>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="options-list">
          {filteredOptions.map((option, index) => (
            <li key={index} onClick={() => handleOptionClick(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;