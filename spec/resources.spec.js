import supertest from 'supertest';
import app from '../app.js';
import Resource from '../models/Resource.js';
import UserResource from '../models/UserResource.js';

const request = supertest(app);

describe('Resources API', () => {
  let authToken;
  let resourceId;

  // Helper function to register and login a user
  const setupAuthUser = async () => {
    await request
      .post('/users/register')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });

    const loginRes = await request
      .post('/users/login')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });

    return loginRes.body.token;
  };

  beforeAll(async () => {
    authToken = await setupAuthUser();
  });

  describe('POST /resources/init', () => {
    it('should initialize all resources for user', async () => {
      const res = await request
        .post('/resources/init')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('resources');
      expect(res.body.resources).toBeArray();
      expect(res.body.resources[0]).toHaveProperty('amount', 0);
    });

    it('should be idempotent', async () => {
      // Second initialization
      const res = await request
        .post('/resources/init')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body.resources).toBeArray();
      expect(res.body.resources[0]).toHaveProperty('amount', 0);
    });
  });

  beforeEach(async () => {
    // Get the first resource ID from the database
    const resource = await Resource.findOne();
    resourceId = resource._id;
  });

  describe('GET /resources', () => {
    it('should return all resources for authenticated user', async () => {
      const res = await request
        .get('/resources')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toBeArray();
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('price');
    });

    it('should require authentication', async () => {
      const res = await request.get('/resources');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /resources/:id/resource', () => {
    it('should return 404 for non-existent user resource', async () => {
      const res = await request
        .get(`/resources/999/resource`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Resource not found for this user');
      expect(res.body).toHaveProperty('amount', 0);
    });

    it('should return user resource after initialization', async () => {
      // First initialize resources for user
      await request
        .post('/resources/init')
        .set('Authorization', `Bearer ${authToken}`);

      const res = await request
        .get(`/resources/${resourceId}/resource`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('resourceId');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('price');
      expect(res.body).toHaveProperty('amount', 0);
    });
  });

  describe('PATCH /resources/:id/resource', () => {
    it('should update resource amount', async () => {
      const res = await request
        .patch(`/resources/${resourceId}/resource`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('amount', 100);
    });

    it('should return 404 for non-existent resource', async () => {
      const res = await request
        .patch('/resources/999/resource')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100 });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /resources/user/resources', () => {
    it('should return all user resources after initialization', async () => {
      // First initialize resources
      await request
        .post('/resources/init')
        .set('Authorization', `Bearer ${authToken}`);

      const res = await request
        .get('/resources/user/resources')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toBeArray();
      expect(res.body.data[0]).toHaveProperty('resourceId');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('price');
      expect(res.body.data[0]).toHaveProperty('amount');
    });

    it('should require authentication', async () => {
      const res = await request.get('/resources/user/resources');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /resources/:id', () => {
    let adminToken;

    beforeAll(async () => {
      // Login as admin
      const loginRes = await request
        .post('/users/login')
        .send({
          username: 'adminLEL',
          password: 'passwordLEL'
        });
      adminToken = loginRes.body.token;
    });

    it('should require authentication', async () => {
      const res = await request.delete(`/resources/${resourceId}`);
      expect(res.status).toBe(401);
    });

    it('should require admin privileges', async () => {
      const res = await request
        .delete(`/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`); // Regular user token
      expect(res.status).toBe(403);
    });

    it('should delete resource if admin', async () => {
      const res = await request
        .delete(`/resources/${resourceId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(204);

      // Verify resource is deleted
      const checkRes = await request
        .get(`/resources/${resourceId}/resource`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 for non-existent resource', async () => {
      const res = await request
        .delete('/999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});