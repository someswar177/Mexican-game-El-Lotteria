const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/start', async (req, res) => {
    const { user1Grid, user2Grid } = req.body;
    console.log(user1Grid,user2Grid)

    try {
        await User.deleteMany({ userId: { $in: ['User1', 'User2'] } }); 

        const user1 = await User.create({ userId: 'User1', grid: user1Grid });
        const user2 = await User.create({ userId: 'User2', grid: user2Grid });

        res.status(201).json({ 
            message: 'Grids saved successfully',
            user1Id: user1._id,
            user2Id: user2._id
        });

        console.log("Users created with IDs:", user1._id, user2._id);
    } catch (error) {
        console.error('Error saving grids:', error);
        res.status(500).json({ message: 'Error saving grids' });
    }
});


router.post('/generate-number', async (req, res) => {
    const { number } = req.body;
    console.log("Received number:", number);

    try {
        const users = await User.find({ status: 'playing' });
        console.log("Processing generated number:", number);

        for (let user of users) {
            if (user.grid.flat().includes(number)) {
                user.cutNumbers.push(number);
                await user.save();
            }
        }

        const winners = await checkForWinner();
        if (winners) {
            return res.status(200).json({ winners });
        }

        res.status(200).json({ message: 'Number processed' });
    } catch (error) {
        console.error('Error processing number:', error);
        res.status(500).json({ message: 'Error processing number' });
    }
});

const checkForWinner = async () => {
    const users = await User.find();
    const winners = []; 

    for (let user of users) {
        const grid = user.grid;
        const marked = user.cutNumbers;

        for (let row of grid) {
            if (row.every(num => marked.includes(num))) {
                user.status = 'won';
                await user.save();
                winners.push(user.userId);  
                break; 
            }
        }

        for (let i = 0; i < 3; i++) {
            const column = [grid[0][i], grid[1][i], grid[2][i]];
            if (column.every(num => marked.includes(num))) {
                user.status = 'won';
                await user.save();
                winners.push(user.userId); 
                break;
            }
        }
    }

    return winners.length > 0 ? winners : null; 
};

module.exports = router;
