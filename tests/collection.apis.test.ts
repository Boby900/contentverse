import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js'
import { db } from '../src/db/index.js';


describe("test case for the user endpoint", ()=>{
    it("initial test", async()=>{
        const response = await request(app).get("/api/");
        expect(response.body).toEqual({
            message: "Hello World!"
        })
        expect(response.status).toBe(200)
    })
})