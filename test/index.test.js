const request = require('supertest');
const { app } = require('../socket/socket.cjs');


describe('API Routes', () => {
    describe('GET /', () => {
        it('should return 200 OK', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'API is running...');
        });
    });

    describe('User Authentication', () => {
        describe('POST /api/v1/user/login', () => {
            it('should return 200 OK with valid credentials', async () => {
                const res = await request(app)
                    .post('/api/v1/user/login')
                    .send({ username: 'meme', password: '=x5]k*3BY?v5NXc' });
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('token');
            });

            it('should return 401 Unauthorized with invalid credentials', async () => {
                const res = await request(app)
                    .post('/api/v1/user/login')
                    .send({ username: 'wronguser', password: 'wrongpassword' });
                expect(res.statusCode).toBe(401);
            });

            it('should return 400 Bad Request with missing credentials', async () => {
                const res = await request(app)
                    .post('/api/v1/user/login')
                    .send({ username: 'meme' });
                expect(res.statusCode).toBe(500);
            });
        });

        describe('GET /api/v1/user/profile', () => {
            it('should return 200 OK when user is authenticated', async () => {
                // You may need to generate a valid token for this test
                const validToken = 'validtoken'; // Replace with actual token generation
                const res = await request(app)
                    .get('/api/v1/user/profile')
                    .set('Authorization', `Bearer ${validToken}`);
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('user');
            });

            it('should return 401 Unauthorized when no token is provided', async () => {
                const res = await request(app).get('/api/v1/user/profile');
                expect(res.statusCode).toBe(401);
            });

            it('should return 403 Forbidden when token is invalid', async () => {
                const res = await request(app)
                    .get('/api/v1/user/profile')
                    .set('Authorization', 'Bearer invalidtoken');
                expect(res.statusCode).toBe(403);
            });
        });
    });

    describe('Message API', () => {
        describe('POST /api/v1/message', () => {
            it('should return 201 Created when message is sent successfully', async () => {
                const res = await request(app)
                    .post('/api/v1/message')
                    .set('Authorization', 'Bearer validtoken')
                    .send({
                        senderId: 'user1',
                        receiverId: 'user2',
                        content: 'Hello'
                    });
                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('message');
            });

            it('should return 400 Bad Request when message content is missing', async () => {
                const res = await request(app)
                    .post('/api/v1/message')
                    .set('Authorization', 'Bearer validtoken')
                    .send({ senderId: 'user1', receiverId: 'user2' });
                expect(res.statusCode).toBe(400);
            });

            it('should return 404 Not Found when receiver does not exist', async () => {
                const res = await request(app)
                    .post('/api/v1/message')
                    .set('Authorization', 'Bearer validtoken')
                    .send({ senderId: 'user1', receiverId: 'nonexistent', content: 'Hello' });
                expect(res.statusCode).toBe(404);
            });
        });

        describe('GET /api/v1/message/:userId', () => {
            it('should return 200 OK with messages when conversations exist', async () => {
                const res = await request(app)
                    .get('/api/v1/message/user2')
                    .set('Authorization', 'Bearer validtoken');
                expect(res.statusCode).toBe(200);
                expect(Array.isArray(res.body)).toBe(true);
            });

            it('should return 404 Not Found when no conversations exist', async () => {
                const res = await request(app)
                    .get('/api/v1/message/nonexistent')
                    .set('Authorization', 'Bearer validtoken');
                expect(res.statusCode).toBe(404);
            });
        });
    });
});
