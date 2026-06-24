import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(err.message);

    if (err.name === 'ZodError') {
        return res.status(400).json({ error: err.errors[0].message });
    }

    res.status(500).json({ error: 'Internal Server Error' });
};