import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import {Recipe} from '@prisma/client';
import config from '../config';


describe("GET /ingredient/:name", () => {

    test("Authorized user fetches existing ingredient", async () => {
        const response = await supertest(app).get("/recipe/ingredient/parowki").query
        ({
            excludeMyRecipes: true,
            page: 1,
            limit: 5,
        })
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        

        console.log(response.body);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    })
})