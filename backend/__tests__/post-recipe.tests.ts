import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';


describe("POST /recipe", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).post("/recipe").query(
                {
                page: 1,
                limit: 10,
                excludeMyRecipes: false,
                categoryName: null,
                ingredientName: null,
                }
        )

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })
})