import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';


describe("POST /auth/refresh", () => {

    test("No refresh token in a cookie", async () => {
        const response = await supertest(app).post("/auth/refresh")
        .set('Cookie','g_state={"i_l":0};')
        
        console.log(response.body);
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Unauthorized')
    })

    test("Invalid refresh token in a cookie", async () => {
        const response = await supertest(app).post("/auth/refresh")
        .set('Cookie','g_state={"i_l":0}; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzA1NDk4MzE4LCJleHAiOjE3MDYxMDMxMTh9.-OIUw2atKXz6rm8yo1tjkMLZ1yO74vh8s3oSGRzJa5s')
        
        console.log(response.body);
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Unauthorized')
    })
})