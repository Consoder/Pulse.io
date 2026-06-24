import request from 'supertest';
import app from '../src/app.js';
import { redis } from '../src/config/redis.js';

describe('URL Shortener API', () => {
    
    it('should create a new short URL', async () => {
        const res = await request(app)
            .post('/api/shorten')
            .send({ url: 'https://github.com' });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('shortCode');
        expect(res.body.originalUrl).toEqual('https://github.com');
    });

    it('should return 404 for non-existent short URL', async () => {
        const res = await request(app).get('/invalidcode123');
        expect(res.statusCode).toEqual(404);
    });

    it('should redirect successfully to the original URL', async () => {
        // 1. Create it
        const createRes = await request(app)
            .post('/api/shorten')
            .send({ url: 'https://openai.com' });
        
        const { shortCode } = createRes.body;

        // 2. Access it (Redirect)
        const res = await request(app).get(`/${shortCode}`);
        
        // Supertest handles redirects, we want to ensure it issues a 302
        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toEqual('https://openai.com');
    });

});
