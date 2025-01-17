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

describe('GET /upgrades', function() {
  it('should retrieve the list of upgrades', async function() {
    // First, create an upgrade
    const createRes = await supertest(app)
      .post('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        _id: 1,  // Added _id as it's required in the schema
        name: 'Speed Boost',
        production: 2,
        price: 500
      })
      .expect(201);  // Changed from 200 to 201 for creation

    // Then, get the list of upgrades
    const res = await supertest(app)
      .get('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.upgrades).toBeDefined();
    expect(Array.isArray(res.body.upgrades)).toBe(true);
    expect(res.body.upgrades).toHaveLength(1);
    expect(res.body.upgrades[0]).toEqual(
      expect.objectContaining({
        _id: 1,
        name: 'Speed Boost',
        production: 2,
        price: 500
      })
    );
  });
});

describe('GET /upgrades/next', function() {
  it('should get the next available upgrade', async function() {
    // First, create some upgrades
    await supertest(app)
      .post('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        _id: 1,
        name: 'Speed Boost I',
        production: 2,
        price: 500
      });

    await supertest(app)
      .post('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        _id: 2,
        name: 'Speed Boost II',
        production: 4,
        price: 1000,
        unlockLevel: 1
      });

    // Get next available upgrade
    const res = await supertest(app)
      .get('/upgrades/next')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeDefined();
    expect(res.body).toEqual(
      expect.objectContaining({
        _id: 1,
        name: 'Speed Boost I',
        production: 2,
        price: 500
      })
    );
  });
});

describe('GET /upgrades/:id', function() {
  it('should get a specific upgrade by ID', async function() {
    // First, create an upgrade
    await supertest(app)
      .post('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        _id: 1,
        name: 'Speed Boost',
        production: 2,
        price: 500
      });

    // Get the specific upgrade
    const res = await supertest(app)
      .get('/upgrades/1')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: 1,
        name: 'Speed Boost',
        production: 2,
        price: 500
      })
    );
  });

  it('should return 404 for non-existent upgrade', async function() {
    await supertest(app)
      .get('/upgrades/999')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});

describe('GET /upgrades with filters', function() {
  beforeEach(async function() {
    // Create test upgrades
    await supertest(app)
      .post('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Speed Boost I',
        production: 2,
        price: 500
      });

    await supertest(app)
      .post('/upgrades')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Power Boost I',
        production: 4,
        price: 1000
      });
  });

  it('should filter upgrades by price range', async function() {
    const res = await supertest(app)
      .get('/upgrades?minPrice=400&maxPrice=600')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.upgrades).toBeDefined();
    expect(res.body.upgrades).toHaveLength(1);
    expect(res.body.upgrades[0]).toEqual(
      expect.objectContaining({
        name: 'Speed Boost I',
        price: 500
      })
    );
  });

  it('should filter upgrades by production range', async function() {
    const res = await supertest(app)
      .get('/upgrades?minProduction=3&maxProduction=5')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.upgrades).toHaveLength(1);
    expect(res.body.upgrades[0]).toEqual(
      expect.objectContaining({
        name: 'Power Boost I',
        production: 4
      })
    );
  });

  it('should filter upgrades by name', async function() {
    const res = await supertest(app)
      .get('/upgrades?name=Speed')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.upgrades).toHaveLength(1);
    expect(res.body.upgrades[0]).toEqual(
      expect.objectContaining({
        name: 'Speed Boost I'
      })
    );
  });
});
