import React, { useState } from 'react';
import axios from 'axios';
import Grid from './components/Grid';
import Popup from './components/Popup';
import { io } from "socket.io-client";
import './App.css'

const App = () => {
    const apiUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000" ;
    console.log(apiUrl);
    const socket = io(apiUrl);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [user1Name, setUser1Name] = useState('User 1'); 
    const [user2Name, setUser2Name] = useState('User 2'); 
    const [winners, setWinners] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [generatedNumbers, setGeneratedNumbers] = useState([]);
    const [user1Id, setUser1Id] = useState(null);
    const [user2Id, setUser2Id] = useState(null);

    socket.on('winner', (data) => {
        console.log('Winner detected:', data.userId);
    });
    const [user1Grid, setUser1Grid] = useState(
        Array.from({ length: 3 }, () => Array(3).fill(''))
    );
    const [user2Grid, setUser2Grid] = useState(
        Array.from({ length: 3 }, () => Array(3).fill(''))
    );

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
        const isGridEmpty = (grid) => grid.flat().every(cell => cell === '');
        const isGridIncomplete = (grid) => grid.flat().filter(cell => cell !== '').length < 9;

        if (isGridEmpty(user1Grid) || isGridEmpty(user2Grid)) {
            setPopupMessage("Grids should not be empty.");
            setShowPopup(true);
            return;
        }

        if (isGridIncomplete(user1Grid) || isGridIncomplete(user2Grid)) {
            setPopupMessage("Please fill the grids completely with 9 numbers.");
            setShowPopup(true);
            return;
        }

        if (JSON.stringify(user1Grid) === JSON.stringify(user2Grid)) {
            setPopupMessage("The grids for User 1 and User 2 cannot be the same.");
            setShowPopup(true);
            return;
        }

        try {
            if (!isGameActive) {
                console.log(user1Grid);
                const response = await axios.post(`${apiUrl}/api/game/start`, {user1Name,user2Name, user1Grid, user2Grid });
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
            const response = await axios.post(`${apiUrl}/api/game/generate-number`, { number: randomNumber });
            console.log("Number sent to backend:", randomNumber);

            setGeneratedNumbers([...generatedNumbers, randomNumber]);

            if (response.data.winners) {
                setWinners(response.data.winners.map(winner => winner.userId));
                console.log(response.data.winners);
                console.log(winners);
            }
        } catch (error) {
            console.error('Error generating number:', error.response?.data || error.message);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupMessage('');
    };

    return (
        <div className="App">
            <h1>El Lotteria Game</h1>
            <div className="grid-container">
                <div>
                    <input
                        type="text"
                        value={user1Name}
                        onChange={(e) => setUser1Name(e.target.value)}
                        className="user-name-input"
                        disabled={isGameActive} 
                    />
                    <Grid
                        grid={user1Grid}
                        setGrid={(grid) => handleGridUpdate('user1', grid)}
                        generatedNumbers={generatedNumbers}
                        isGameActive={isGameActive}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        value={user2Name}
                        onChange={(e) => setUser2Name(e.target.value)}
                        className="user-name-input"
                        disabled={isGameActive} 
                    />
                    <Grid
                        grid={user2Grid}
                        setGrid={(grid) => handleGridUpdate('user2', grid)}
                        generatedNumbers={generatedNumbers}
                        isGameActive={isGameActive}
                    />
                </div>
            </div>
            {winners.length > 1 ? (
                <h2 className="winner-announcement">&#129321; Winners: {winners.join(', ')} &#129395;</h2>
            ) : (winners.length > 0 && <h2 className="winner-announcement">&#129321; Winner: {winners.join(', ')} &#129395;</h2>)
            }
            <div className="buttons-container">
                <button onClick={startGame}>
                {isGameActive ? <div style={{ color: "black" }}>Start New Game</div> : 'Start Game'}
                </button>
                <button onClick={generateNumber} disabled={!isGameActive} hidden={winners.length > 0}>
                    Generate Number
                </button>
            </div>
            {showPopup && <Popup message={popupMessage} onClose={closePopup} />}
        </div>
    );
};

export default App;
