import React, { useState } from 'react';
import axios from 'axios';
import Grid from './components/Grid';
import StartButton from './components/StartButton';
import StopButton from './components/StopButton';

const App = () => {
  const [user1Grid, setUser1Grid] = useState(Array(3).fill(Array(3).fill('')));
  const [user2Grid, setUser2Grid] = useState(Array(3).fill(Array(3).fill('')));
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = async () => {
    try {
      await axios.post('/api/game/start', { user1Grid, user2Grid });
      setGameStarted(true);
      generateRandomNumbers();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const stopGame = () => {
    setGameStarted(false);
  };

  const generateRandomNumbers = async () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    while (gameStarted && numbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      const randomNumber = numbers.splice(randomIndex, 1)[0];

      try {
        const response = await axios.post('/api/game/generate-number', { number: randomNumber });
        if (response.data.winner) {
          alert(`${response.data.winner} wins!`);
          setGameStarted(false);
          break;
        }
      } catch (error) {
        console.error('Error generating number:', error);
      }

      await new Promise(r => setTimeout(r, 1000));
    }
  };

  return (
    <div>
      <h1>Lottery Game</h1>
      <div>
        <h2>User 1 Grid</h2>
        <Grid grid={user1Grid} setGrid={setUser1Grid} />
      </div>
      <div>
        <h2>User 2 Grid</h2>
        <Grid grid={user2Grid} setGrid={setUser2Grid} />
      </div>
      <StartButton onClick={startGame} />
      <StopButton onClick={stopGame} />
    </div>
  );
};

export default App;
