import supertest from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { cleanUpDatabase } from "../utils.js";

let userToken;

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1/my-app-test');
});

beforeEach(async () => {
  await cleanUpDatabase();
  
  // Create a new user for each test
  await supertest(app)
    .post('/users/register')
    .send({
      username: 'adminLEL',
      password: 'passwordLEL'
    });

  // Log in and get fresh token
  const loginResponse = await supertest(app)
    .post('/users/login')
    .send({
      username: 'adminLEL',
      password: 'passwordLEL'
    });

  userToken = loginResponse.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /resources', function() {
  it('should create a new resource', async function() {
    const res = await supertest(app)
      .post('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 100
      })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: 'Gold',
        price: 100
      })
    );
  });
});

describe('GET /resources', function() {
  it('should retrieve the list of resources', async function() {
    // First, create a resource
    await supertest(app)
      .post('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 100
      });

    // Then, get the list of resources
    const res = await supertest(app)
      .get('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: 'Gold',
        price: 100
      })
    );
  });
});

describe('GET /resources/:id', function() {
  it('should retrieve a resource by ID', async function() {
    // First, create a resource
    const createRes = await supertest(app)
      .post('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 100
      });

    const resourceId = createRes.body._id;

    // Then, get the resource by ID
    const res = await supertest(app)
      .get(`/resources/${resourceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: resourceId,
        name: 'Gold',
        price: 100
      })
    );
  });
});

describe('PUT /resources/:id', function() {
  it('should update a resource by ID', async function() {
    // First, create a resource
    const createRes = await supertest(app)
      .post('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 100
      });

    const resourceId = createRes.body._id;

    // Then, update the resource by ID
    const res = await supertest(app)
      .put(`/resources/${resourceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 150
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: resourceId,
        name: 'Gold',
        price: 150
      })
    );
  });
});

describe('DELETE /resources/:id', function() {
  it('should delete a resource by ID', async function() {
    // First, create a resource
    const createRes = await supertest(app)
      .post('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 100
      });

    const resourceId = createRes.body._id;

    // Then, delete the resource by ID
    await supertest(app)
      .delete(`/resources/${resourceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    // Verify the resource is deleted
    await supertest(app)
      .get(`/resources/${resourceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});

describe('GET /resources/stats', function() {
  it('should get resource statistics for users', async function() {
    // First create a resource
    const createRes = await supertest(app)
      .post('/resources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Gold',
        price: 100
      });

    // Initialize resources for user
    await supertest(app)
      .post('/resources/init')
      .set('Authorization', `Bearer ${userToken}`);

    // Update resource amount
    await supertest(app)
      .patch(`/resources/${createRes.body._id}/resource`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 10 });

    // Get stats
    const res = await supertest(app)
      .get('/resources/stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
      expect.objectContaining({
        username: 'adminLEL',
        totalResources: 10,
        totalValue: 1000,
        resourceCount: 1,
        resources: expect.arrayContaining([
          expect.objectContaining({
            name: 'Gold',
            amount: 10,
            value: 1000
          })
        ])
      })
    );
  });
});