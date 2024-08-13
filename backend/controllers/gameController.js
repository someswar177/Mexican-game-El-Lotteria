const User = require('../models/User');

const checkWinCondition = async (userId) => {
    const user = await User.findOne({ userId });

    for (let i = 0; i < 3; i++) {
        if (user.grid[i].every(num => user.cutNumbers.includes(num))) {
            return true;
        }
    }

    for (let i = 0; i < 3; i++) {
        if ([user.grid[0][i], user.grid[1][i], user.grid[2][i]].every(num => user.cutNumbers.includes(num))) {
            return true;
        }
    }

    return false;
};

exports.startGame = async (req, res) => {
    try {
        const { userId, grid } = req.body;

        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this userId already exists' });
        }

        const newUser = new User({ userId, grid });
        await newUser.save();
        console.log('Saved user:', newUser);
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error saving user:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.generateNumber = async (req, res) => {
    try {
        const randomNumber = Math.floor(Math.random() * 9) + 1;
        await User.updateMany(
            { grid: { $elemMatch: { $in: [randomNumber] } } },
            { $push: { cutNumbers: randomNumber }, $set: { updatedAt: new Date() } }
        );

        const users = await User.find();
        let winner = null;

        for (let user of users) {
            if (await checkWinCondition(user.userId)) {
                winner = user.userId;
                await User.updateOne({ userId: winner }, { $set: { status: 'won' } });
                await User.updateMany({ userId: { $ne: winner } }, { $set: { status: 'lost' } });
                break;
            }
        }

        res.json({ randomNumber, winner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
