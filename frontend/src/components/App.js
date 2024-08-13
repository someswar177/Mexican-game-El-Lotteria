import React, { useState } from 'react';
import Grid from './Grid';
import axios from 'axios';

const App = () => {
    const [user1Grid, setUser1Grid] = useState(
        Array.from({ length: 3 }, () => Array(3).fill(''))
    );
    const [user2Grid, setUser2Grid] = useState(
        Array.from({ length: 3 }, () => Array(3).fill(''))
    );
    const [winners, setWinners] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false); 
    const [generatedNumbers, setGeneratedNumbers] = useState([]);  
    const [user1Id, setUser1Id] = useState(null);  
    const [user2Id, setUser2Id] = useState(null);  

    const handleGridUpdate = (userId, grid) => {
        if (userId === 'user1') setUser1Grid(grid);
        else if (userId === 'user2') setUser2Grid(grid);
    };

    const validateGrids = () => {
        const validateGrid = (grid) => {
            const flattened = grid.flat();
            const uniqueNumbers = new Set(flattened);
            return flattened.length === uniqueNumbers.size;
        };

        return validateGrid(user1Grid) && validateGrid(user2Grid);
    };

    const startGame = async () => {
        if (!validateGrids()) {
            alert("Each grid must contain unique numbers.");
            return; 
        }

        if (JSON.stringify(user1Grid) === JSON.stringify(user2Grid)) {
            alert("The grids for User 1 and User 2 cannot be the same.");
            return; 
        }
        
        try {
            if (!isGameActive) {
                console.log(user1Grid);
                const response = await axios.post('http://localhost:5000/api/game/start', { user1Grid, user2Grid });
                console.log("Game started from frontend");

                setUser1Id(response.data.user1Id);
                setUser2Id(response.data.user2Id);

                setGeneratedNumbers([]); 
                setWinners([]); 
            } else {
                console.log("Game stopped from frontend");
                window.location.reload();
            }
            setIsGameActive(!isGameActive);  
        } catch (error) {
            console.error('Error starting/stopping the game:', error.response?.data || error.message);
        }
    };

    const generateNumber = async () => {
        let randomNumber;

        if (generatedNumbers.length === 9) {
            console.log("All numbers have been generated.");
            return;
        }

        do {
            randomNumber = Math.floor(Math.random() * 9) + 1;  
        } while (generatedNumbers.includes(randomNumber));

        console.log("Generated number:", randomNumber);

        try {
            const response = await axios.post('http://localhost:5000/api/game/generate-number', { number: randomNumber });
            console.log("Number sent to backend:", randomNumber);
            
            setGeneratedNumbers([...generatedNumbers, randomNumber]); 

            if (response.data.winners) {
                setWinners(response.data.winners);
                console.log(winners);
            }
        } catch (error) {
            console.error('Error generating number:', error.response?.data || error.message);
        }
    };

    return (
    <div className="App">
        <h1>El Lotteria Game</h1>
        <div className="grid-container">
            <div>
                <h2>User 1 Grid</h2>
                <Grid grid={user1Grid} setGrid={(grid) => handleGridUpdate('user1', grid)} generatedNumbers={generatedNumbers} />
            </div>
            <div>
                <h2>User 2 Grid</h2>
                <Grid grid={user2Grid} setGrid={(grid) => handleGridUpdate('user2', grid)} generatedNumbers={generatedNumbers} />
            </div>
        </div>
        <div className="buttons-container">
            <button onClick={startGame}>
                {isGameActive ? 'Start New Game' : 'Start Game'}
            </button>
            <button onClick={generateNumber} disabled={!isGameActive} hidden={winners.length > 0}>
                Generate Number
            </button>
        </div>
        {winners.length > 0 && (
            <h2>Winners: {winners.join(', ')}</h2>
        )}
        {user1Id && <p>User 1 ID: {user1Id}</p>}
        {user2Id && <p>User 2 ID: {user2Id}</p>}
    </div>
);
};

export default App;
