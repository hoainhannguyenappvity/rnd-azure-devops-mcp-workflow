import express from 'express';
import { getAllDiffsCommit } from './pull-request.model.mjs';

const router = express.Router();

router.get('/diffs-commit', async (req, res) => {
  const result = await getAllDiffsCommit(req);
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

export { router as PullRequestRouter };
