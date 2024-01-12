import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';

describe("GET /recipe", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).get("/recipe").query(
                {
                page: 1,
                limit: 10,
                excludeMyRecipes: false,
                categoryName: null,
                ingredientName: null,
                }
        )

        console.dir(response.body); 
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

})

//  .set('Authorization', "Bearer aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")