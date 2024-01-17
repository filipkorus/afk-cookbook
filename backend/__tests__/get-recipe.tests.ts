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
        const response = await supertest(app).get("/recipe").query(
            {page: 'xd'}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)


        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Some query params are missing or invalid")
    })

    test("Authorized user enters page param as float", async () => {
        const response = await supertest(app).get("/recipe").query(
            {page: 3.14}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Some query params are missing or invalid")
    })

    test("Authorized user fetches recipes of nonexistent user", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 25,
              userId: 9999}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)


        expect(response.status).toBe(400);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toContain("No more pages")
    })

    test("Authorized user fetches recipes with limit over 25", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 30}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        expect(response.status).toBe(200);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(true);

        const bodyProperties = ['page', 'limit', 'totalRecipes', 'totalPages', 'recipes']
        
        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const recipeProperties = ['author', 'id', 'title',
        'cookingTimeMinutes', 'description', 'isPublic', 'createdAt', 'location',
        'userId', 'categories', 'ingredients', 'stars']
    
        for (const recipe of response.body.recipes) {
            expect(recipe.isPublic).toBe(true)
            for (const property of recipeProperties) {
                expect(recipe).toHaveProperty(property);
            }
        }
    })

    test("Authorized user fetches public recipes with other userid", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 25,
              userId: 3
            }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        expect(response.status).toBe(200);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(true);

        const bodyProperties = ['page', 'limit', 'totalRecipes', 'totalPages', 'recipes']
        
        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const recipeProperties = ['author', 'id', 'title',
        'cookingTimeMinutes', 'description', 'isPublic', 'createdAt', 'location',
        'userId', 'categories', 'ingredients', 'stars']
    
        for (const recipe of response.body.recipes) {
            expect(recipe.isPublic).toBe(true);
            expect(recipe.author.id).not.toBe(config.TEST.USER_ID)
            
            for (const property of recipeProperties) {
                expect(recipe).toHaveProperty(property);
  
            }
        }
    })

    test("Authorized user fetches non-public recipes with other userid", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 25,
              userId: 3,
              includePublic: false}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        console.dir(response.body);
        

        expect(response.status).toBe(404);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(false);
    })

    test("Authorized user fetches no public and no private recipes with other userid", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 25,
              userId: 3,
              includePublic: false,
              includePrivate: false}
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        

        expect(response.status).toBe(404);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(false);
    })

    test("Authorized user fetches private recipes ", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 25,
              includePublic: false,
            }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(200);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(false);

        const bodyProperties = ['page', 'limit', 'totalRecipes', 'totalPages', 'recipes']
        
        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const recipeProperties = ['author', 'id', 'title',
        'cookingTimeMinutes', 'description', 'isPublic', 'createdAt', 'location',
        'userId', 'categories', 'ingredients', 'stars']
    
        for (const recipe of response.body.recipes) {
            expect(recipe.isPublic).toBe(true);
            
            for (const property of recipeProperties) {
                expect(recipe).toHaveProperty(property);
  
            }
        }

    })

    test("Authorized user fetches everything but his own recipes ", async () => {
        const response = await supertest(app).get("/recipe").query(
            { page: 1,
              limit: 25,
              excludeMyRecipes: true
            }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(404);
        expect(response.body.limit).toBe(25);
        expect(response.body.success).toBe(false);
        
        const bodyProperties = ['page', 'limit', 'totalRecipes', 'totalPages', 'recipes']
        
        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const recipeProperties = ['author', 'id', 'title',
        'cookingTimeMinutes', 'description', 'isPublic', 'createdAt', 'location',
        'userId', 'categories', 'ingredients', 'stars']
    
        for (const recipe of response.body.recipes) {
            expect(recipe.isPublic).toBe(true);
            expect(recipe.author.userId).toBe(!config.TEST.USER_ID)
            
            for (const property of recipeProperties) {
                expect(recipe).toHaveProperty(property);
  
            }
        }
    })

})

