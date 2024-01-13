import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import {Recipe} from '@prisma/client';
import config from '../config';


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

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user able to browse public recipes on the wall", async () => {
        const response = await supertest(app).get("/recipe").query(
                {
                page: 1,
                limit: 10,
                excludeMyRecipes: false,
                categoryName: null,
                ingredientName: null,
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const recipes: Recipe[] = response.body.recipes;
        expect(recipes.every(recipe => recipe.isPublic === true)).toBe(true);
    })

    test("Authorized user trying to enter invalid data in request", async () => {
        const response = await supertest(app).get("/recipe").query(
            {page: 'xd'}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        console.dir(response.body)
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("page number OR maximum of recipes for page param is required")
    })






})

//  .set('Authorization', "Bearer aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")