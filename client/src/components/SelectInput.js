import React from 'react';

const SelectInput = ({ label, value, onChange, options }) => {
  return (
    <div className="select-input">
      <h3>{label}</h3>
      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;