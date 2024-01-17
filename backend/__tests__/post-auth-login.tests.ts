import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';


describe("POST /auth/login", () => {

    test("User enters invalid token", async () => {
        const response = await supertest(app).post("/auth/login").send
        ({
            credential: 'test'
          })
        
        console.log(response.body);
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Invalid username or password')
    })
})