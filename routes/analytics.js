import express from 'express';

const router = express.Router();

router.get('/user', (req, res) => {
    res.json({ message: 'User analytics endpoint' });
});

router.get('/streams', (req, res) => {
    res.json({ message: 'Streams analytics endpoint' });
});

export default router;