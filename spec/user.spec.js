import supertest from 'supertest';
import app from '../app.js';

const request = supertest(app);

describe('Authentication Flow', () => {
  describe('POST /users/register', () => {
    // Test #1: Vérifier qu'un nouvel utilisateur peut s'inscrire avec succès
    it('should register a new user successfully', async () => {
      const res = await request
        .post('/users/register')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    // Test #2: Vérifier qu'on ne peut pas créer deux comptes avec le même nom d'utilisateur
    it('should not allow duplicate usernames', async () => {
      // Duplicate registration attempt with same username as Test #1
      const res = await request
        .post('/users/register')
        .send({
          username: 'testuser', 
          password: 'differentpass'
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch("User already exists");
    });
  });

  describe('POST /users/login', () => {
    beforeEach(async () => {
      await request
        .post('/users/register')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });
    });

    // Test #3: Vérifier qu'un utilisateur peut se connecter avec les bons identifiants
    it('should login successfully with correct credentials', async () => {
      const res = await request
        .post('/users/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    // Test #4: Vérifier qu'un utilisateur ne peut pas se connecter avec un mauvais mot de passe
    it('should fail with incorrect password', async () => {
      const res = await request
        .post('/users/login')
        .send({
          username: 'testuser',
          password: 'wrongpass'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });
});