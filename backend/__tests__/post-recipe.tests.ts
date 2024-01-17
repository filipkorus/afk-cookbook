import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';


describe("POST /recipe", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).post("/recipe").send(
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

    test("Authorized can post a valid recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                title: "Moj najlepszy przepis",
                cookingTimeMinutes: 40,
                description: "Sekretnym składnikiem jest miłość.",
                isPublic: true,
                ingredients: ['milosc'],
                categories: ['najlepsze']
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
        
        console.log(response.body);
        

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    })
})