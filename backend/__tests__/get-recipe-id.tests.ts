import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';


describe("GET /recipe/id", () => {

    test("Unauthorized user cant see recipes by id", async () => {
        const response = await supertest(app).get("/recipe/1")

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Unauthorized');
    })

    test(`Authorized user can see public recipes by id, which contain
    author, id, title, cookingtime, description, isPublic flag, creation time,
    location, userId, categories, ingredients, and stars`, async () => {
    const response = await supertest(app).get("/recipe/2")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`);


    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    const recipeProperties = ['author', 'id', 'title',
    'cookingTimeMinutes', 'description', 'isPublic', 'createdAt', 'location',
    'userId', 'categories', 'ingredients', 'stars']

    for (const property of recipeProperties) {
        expect(response.body.recipe).toHaveProperty(property);
    }
});



    test("Authorized user cant enter float as recipe id", async () => {
        const response = await supertest(app).get("/recipe/3.14")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Invalid or missing 'id' param");

    })

    test("Authorized user cant enter string as recipe id", async () => {
        const response = await supertest(app).get("/recipe/test")
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe("Invalid or missing 'id' param");

    })

    test("Authorized user cant see nonexistent recipes", async () => {
        const invalidId = 99999999999999;

        const response = await supertest(app).get(`/recipe/${invalidId}`)
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)


        
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe(`Recipe with ID of ${invalidId} not found.`);

    })

})