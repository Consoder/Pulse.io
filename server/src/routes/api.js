import express from 'express';
import { shortenUrl, redirectUrl } from '../controllers/urlController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.post('/api/shorten', limiter, shortenUrl);
router.get('/:code', redirectUrl);

export default router;