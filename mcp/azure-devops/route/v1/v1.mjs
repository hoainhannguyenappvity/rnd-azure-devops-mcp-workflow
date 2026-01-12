import express from 'express';
import { PingRouter } from './ping/ping.controller.mjs';
import { PullRequestRouter } from './pull-request/pull-request.controller.mjs';

const router = express.Router();
router.use('/ping', PingRouter);
router.use('/pull-request', PullRequestRouter);

export { router as V1Router };
