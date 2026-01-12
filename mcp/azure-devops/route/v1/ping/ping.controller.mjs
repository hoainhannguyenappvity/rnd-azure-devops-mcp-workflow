import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json({ ping: 'pong' });
  } catch (error) {}
});

export { router as PingRouter };
