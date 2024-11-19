import request from 'supertest';
import app from '../src/index.js';
import { expect, test, describe, it} from 'vitest'
import { db } from '../src/db/index.js';
import { userTable } from '../src/db/schema.js';


//   describe('POST /logout', () => {
//     it('should log out successfully', async () => {
//       const response = await request(app)
//         .post('/logout')
//         .send({ sessionToken: 'token123' });

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({ message: 'Logout successful.' });
//     });

//     it('should return a 400 error if session token is missing', async () => {
//       const response = await request(app).post('/logout').send({});

//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'Session token is required.' });
//     });
//   });

  // describe('GET /content', () => {
  //   it('should get all content successfully', async () => {
  //     const response = await request(app)
  //       .get('/api/content')
  //       .send({ sessionToken: 'token123' });

  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual({ message: 'Hello getAllContent!' });
  //   });
  // });
 
 
  // describe('POST /content', () => {
  //   it('should create content successfully', async () => {
  //     const response = await request(app)
  //       .post('/api/content')
  //       .send({ title:"test-check",
  //             userId: "2"
  //       });

  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual({ message: 'Hello createContent!' });
  //   });
  // });

  // describe('POST /auth', () => {
  //   it('should create content successfully', async () => {
  //     await db.insert(userTable).values({
  //       email: "test@gmail.com",
  //               password: "bob-bob"
  //     })
  //     const response = await request(app)
  //       .post('/api/auth/signup')
  //       .send({ email: "test@gmail.com",
  //               password: "bob-bob"
  //       });

  //     expect(response.status).toBe(201);
  //     expect(response.body).toEqual({ message: 'Hello createContent!' });
  //   });
  // });


  // describe('GET /dashboard', () => {
  //   it('should return dashboard successfully', async () => {
  //     const response = await request(app)
  //       .get('/api/getProfile')
       

  //     expect(response.status).toBe(201);
  //     expect(response.body).toEqual({ message: 'Hello Profile!' });
  //   });

   

  //   });
  

