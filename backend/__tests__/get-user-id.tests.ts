import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';


describe("GET /user/id", () => {

    test("Unauthorized user cant see others profiles", async () => {
        const response = await supertest(app).get("/user/1")
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Unauthorized');
    })

    test("Authorized user can see others profile", async () => {
        const response = await supertest(app).get("/user/1")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
        

        const userProperties = ['id', 'name', 'picture', 
        'admin', 'joinedAt']

        for (const property of userProperties) {
            expect(response.body.user).toHaveProperty(property);
        }
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    })


    test("Authorized user cant enter float as profile id", async () => {
        const response = await supertest(app).get("/user/3.14")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Invalid or missing 'userId' param");
    })

    test("Authorized user cant enter string as profile id", async () => {
        const response = await supertest(app).get("/user/test")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)


        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Invalid or missing 'userId' param");
    })

    test("Authorized user cant see nonexistent users profile", async () => {
        const invalidId = 99999999999999;

        const response = await supertest(app).get(`/user/${invalidId}`)
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe(`User with ID = ${invalidId} does not exist`);
    })
})