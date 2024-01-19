import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import {Recipe} from '@prisma/client';
import config from '../config';


describe("GET /recipe/category/name", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).get("/recipe/ingredients/").query(
                {
                page: 1,
                limit: 10,
                }
        )

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user able to get recipes by ingredients", async () => {
        const response = await supertest(app).get("/recipe/ingredients/").query(
                {
                commaSeparatedNames: "bulka,woda",
                limit: 20,
                page: 1
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)


        const bodyProperties = ['page', 'limit', 'totalRecipes', 'totalPages', 'recipes']
        
        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const recipeProperties = ['author', 'id', 'title',
        'cookingTimeMinutes', 'description', 'isPublic', 'createdAt', 'location',
        'userId', 'categories', 'ingredients', 'stars']
    
        for (const recipe of response.body.recipes) {
            for (const property of recipeProperties) {
                expect(recipe).toHaveProperty(property);
            }
        }

        
        

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const recipes: Recipe[] = response.body.recipes;
        expect(recipes.every(recipe => recipe.isPublic === true)).toBe(true);
    })

    test("Authorized user enters page param as string", async () => {
        const response = await supertest(app).get("/recipe/ingredients/").query(
            {page: 'xd',
            commaSeparatedNames: "bulka,woda",}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)


        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Some query params are missing or invalid")
    })

    test("Authorized user enters page param as float", async () => {
        const response = await supertest(app).get("/recipe/ingredients/").query(
            {page: 3.14,
            commaSeparatedNames: "bulka,woda",}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Some query params are missing or invalid")
    })

    test("Authorized user fetches recipes with nonexistent ingredients", async () => {
        const response = await supertest(app).get("/recipe/ingredients/").query(
            { page: 1,
              limit: 25,
              commaSeparatedNames: "bulka,woda",}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

               

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toContain("No recipes found")
    })
})
