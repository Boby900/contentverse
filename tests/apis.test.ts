import request from 'supertest';
import app from '../src/index.js';
import { expect, test, describe, it} from 'vitest'


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

  describe('GET /content', () => {
    it('should get all content successfully', async () => {
      const response = await request(app)
        .get('/api/content')
        .send({ sessionToken: 'token123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Hello getAllContent!' });
    });


   
  });


  describe('GET /dashboard', () => {
    it('should return dashboard successfully', async () => {
      const response = await request(app)
        .get('/api/getProfile')
       

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Hello Profile!' });
    });

   

    });
  

