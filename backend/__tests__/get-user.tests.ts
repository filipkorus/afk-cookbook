import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';


describe("GET /user", () => {

    test("Unauthorized user cant see its profile", async () => {
        const response = await supertest(app).get("/user")
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Unauthorized');
    })

    test("Authorized user can see its profile", async () => {
        const response = await supertest(app).get("/user")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
        console.log(response.headers);
        
        const userProperties = ['id', 'name', 'picture', 'email', 
        'admin', 'banned', 'joinedAt']

        for (const property of userProperties) {
            expect(response.body.user).toHaveProperty(property);
        }

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    })

})