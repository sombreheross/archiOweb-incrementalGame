import supertest from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { cleanUpDatabase } from "../utils.js";

beforeEach(async () => {
  await cleanUpDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /users/register', function() {
  it('should register a new user', async function() {
    const res = await supertest(app)
      .post('/users/register')
      .send({
        username: 'testUser',
        password: 'testPassword'
      })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'User registered successfully'
      })
    );
  });

  it('should not register a duplicate user', async function() {
    // First registration
    await supertest(app)
      .post('/users/register')
      .send({
        username: 'testUser',
        password: 'testPassword'
      });

    // Attempt duplicate registration
    const res = await supertest(app)
      .post('/users/register')
      .send({
        username: 'testUser',
        password: 'differentPassword'
      })
      .expect(400);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'User already exists'
      })
    );
  });
});

describe('POST /users/login', function() {
  it('should login a user', async function() {
    // First, register a user
    await supertest(app)
      .post('/users/register')
      .send({
        username: 'testUser',
        password: 'testPassword'
      });

    // Then, login the user
    const res = await supertest(app)
      .post('/users/login')
      .send({
        username: 'testUser',
        password: 'testPassword'
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        token: expect.any(String)
      })
    );
  });

  it('should not login with wrong password', async function() {
    // First, register a user
    await supertest(app)
      .post('/users/register')
      .send({
        username: 'testUser',
        password: 'testPassword'
      });

    // Try to login with wrong password
    const res = await supertest(app)
      .post('/users/login')
      .send({
        username: 'testUser',
        password: 'wrongPassword'
      })
      .expect(400);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'Invalid credentials'
      })
    );
  });

  it('should not login non-existent user', async function() {
    const res = await supertest(app)
      .post('/users/login')
      .send({
        username: 'nonExistentUser',
        password: 'testPassword'
      })
      .expect(404);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'User not found'
      })
    );
  });
});