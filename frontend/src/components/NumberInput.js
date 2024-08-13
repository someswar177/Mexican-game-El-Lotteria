import React from 'react';

const NumberInput = ({ value, onChange }) => {
  return (
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value) || '')} 
      max={9} 
      min={1} 
    />
  );
};

export default NumberInput;
