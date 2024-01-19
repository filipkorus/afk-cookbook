import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';
import exp from 'constants';

describe("GET /recipe/review/stars/recipeId", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).get("/recipe/review/stars/recipeId")

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user can get stars of public recipe", async () => {
        const response = await supertest(app).get(`/recipe/review/stars/21`
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
    

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe("Stars fetched successfully");
        expect(response.body.success).toBe(true);

        

    })
})
