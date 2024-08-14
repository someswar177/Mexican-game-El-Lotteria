import React, { useRef, useState } from 'react';
import '../CSS/Grid.css';
import Popup from './Popup';

const Grid = ({ grid, setGrid, generatedNumbers, isGameActive }) => {
  const inputRefs = useRef([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleInputChange = (row, col, value) => {
    const number = value === '' ? '' : Number(value);

    if (number === '' || (number >= 1 && number <= 9)) {
      const newGrid = grid.map((r, rowIndex) =>
        rowIndex === row ? r.map((v, colIndex) => (colIndex === col ? number : v)) : r
      );
      setGrid(newGrid);
    } else {
      setPopupMessage("Please enter a number between 1 and 9.");
      setShowPopup(true);
    }
  };

  const handleKeyDown = (e, row, col) => {
    const gridSize = 3;  

    switch (e.key) {
      case 'ArrowRight':
        if (col < gridSize - 1) {
          inputRefs.current[row * gridSize + (col + 1)].focus();
        } else if (row < gridSize - 1) {
          inputRefs.current[(row + 1) * gridSize].focus(); 
        }
        e.preventDefault();
        break;

      case 'ArrowLeft':
        if (col > 0) {
          inputRefs.current[row * gridSize + (col - 1)].focus(); 
        } else if (row > 0) {
          inputRefs.current[(row - 1) * gridSize + (gridSize - 1)].focus(); 
        }
        e.preventDefault();
        break;

      case 'ArrowDown':
        if (row < gridSize - 1) {
          inputRefs.current[(row + 1) * gridSize + col].focus(); 
        }
        e.preventDefault();
        break;

      case 'ArrowUp':
        if (row > 0) {
          inputRefs.current[(row - 1) * gridSize + col].focus();
        }
        e.preventDefault();
        break;

      default:
        break;
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
  };

  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((value, colIndex) => (
            <div key={colIndex} className="grid-cell">
              <input
                type="text"
                value={value === '' ? '' : value}
                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                ref={(el) => inputRefs.current[rowIndex * 3 + colIndex] = el}  
                disabled={isGameActive}
              />
              {generatedNumbers.includes(value) && (
                <div className="red-x">&#10060;</div>
              )}
            </div>
          ))}
        </div>
      ))}
      {showPopup && <Popup message={popupMessage} onClose={closePopup} />}
    </div>
  );
};

export default Grid;
