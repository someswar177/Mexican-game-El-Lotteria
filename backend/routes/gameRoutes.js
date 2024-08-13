const express = require('express');
const User = require('../models/User');
const router = express.Router();
const mongoose = require('mongoose');
const io = require('express')().get('socketio'); 

User.watch().on('change', async (change) => {
    try {
        // console.log('Change detected:', change);

        if (change.operationType === 'update') {
            if (change.updateDescription.updatedFields.cutNumbers) {
                const updatedUser = await User.findById(change.documentKey._id);

                if (!updatedUser) {
                    console.error('Error: User not found for ID:', change.documentKey._id);
                    return;
                }

                // console.log('cutNumbers updated:', updatedUser.cutNumbers);

                const winners = await checkForWinner(io);

                if (winners && winners.length > 0) {
                    console.log('Winner(s) detected:', winners);
                    io.emit('winners', winners); 
                } else {
                    console.log('No winners yet.');
                }
            }
        }
    } catch (error) {
        console.error('Error processing change stream:', error);
    }
});

router.post('/start', async (req, res) => {
    const { user1Name,user2Name,user1Grid, user2Grid } = req.body;
    console.log(req.body);
    // console.log(user1Grid, user2Grid);

    try {
        // await User.deleteMany({ userId: { $in: ['User1', 'User2'] } });
        await User.deleteMany();

        const user1 = await User.create({ userId: user1Name, grid: user1Grid });
        const user2 = await User.create({ userId: user2Name, grid: user2Grid });

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
    const io = req.io; 
    try {
        const users = await User.find({ status: 'playing' });
        console.log("Processing generated number:", number);

        await Promise.all(users.map(async (user) => {
            if (user.grid.flat().includes(number)) {
                user.cutNumbers.push(number);
                await user.save();
            }
        }));

        const winners = await checkForWinner(io); 

        if (winners) {
            console.log(winners);
            return res.status(200).json({ winners });
        }

        res.status(200).json({ message: 'Number processed' });
    } catch (error) {
        console.error('Error processing number:', error);
        res.status(500).json({ message: 'Error processing number' });
    }
});

const checkForWinner = async (io) => {
    const users = await User.find();
    const winners = [];

    for (let user of users) {
        const grid = user.grid;
        const marked = user.cutNumbers;

        let hasWon = false;

        for (let row of grid) {
            if (row.every(num => marked.includes(num))) {
                user.status = 'won';
                await user.save();
                hasWon = true;
                break;
            }
        }

        for (let i = 0; i < 3; i++) {
            const column = [grid[0][i], grid[1][i], grid[2][i]];
            if (column.every(num => marked.includes(num))) {
                user.status = 'won';
                await user.save();
                hasWon = true;
                break;
            }
        }

        if (hasWon) {
            winners.push({ userId: user.userId });
        }
    }

    if (winners.length > 0) {
        io.emit('winners', winners); 
    }

    return winners.length > 0 ? winners : null;
};

module.exports = router;
