import React from 'react';

const RadioButton = ({ label, value, checked, onChange }) => {
  return (
    <label>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
};

export default RadioButton;