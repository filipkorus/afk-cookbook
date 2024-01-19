import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';



describe("GET /auth/logout", () => {

    test("Unauthorized user cant log out", async () => {
        const response = await supertest(app).get("/auth/logout")
        .set('Cookie','g_state={"i_l":0}; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzA1NDk4MzE4LCJleHAiOjE3MDYxMDMxMTh9.-OIUw2atKXz6rm8yo1tjkMLZ1yO74vh8s3oSGRzJa5s')
                
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Unauthorized')
    })

    test("Unauthorized users cookie gets maxage 0 and is expired", async () => {
        const response = await supertest(app).get("/auth/logout")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        const setCookieHeaders = response.headers['set-cookie'] as unknown;
        expect(setCookieHeaders).toHaveLength(1);

        const setCookieHeader = (setCookieHeaders as string[])[0];
        expect(setCookieHeader).toContain('Max-Age=0');
        expect(setCookieHeader).toContain('refreshToken=;');

        const expiresMatch = /Expires=([^;]+)/.exec(setCookieHeader);
        expect(expiresMatch).toBeTruthy();

        const expiresDate = Date.parse(expiresMatch![1]);
        expect(expiresDate).toBeLessThan(Date.now());
    })

})