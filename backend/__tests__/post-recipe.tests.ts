import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';


describe("POST /recipe", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: "Moj najlepszy przepis",
                    cookingTimeMinutes: 40,
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: ['milosc'],
                    categories: ['najlepsze']
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
                    isPublic: false,
                    ingredients: ['milosc'],
                    categories: ['najlepsze']
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        
        
        


        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.msg).toBe('Recipe created successfully')

        const recipeProperties = ['ingredients', 'categories', 'id',
        'title', 'cookingTimeMinutes', 'description', 'isPublic',
        'createdAt', 'location', 'userId']
        
        for (const property of recipeProperties) {
            expect(response.body.data.recipe).toHaveProperty(property);
        }

    })

    test("Authorized user cant post an empty recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
        
        
        


        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })

    test("Authorized user cant post a title as a number recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: 6,
                    cookingTimeMinutes: 40,
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: ['milosc'],
                    categories: ['najlepsze']
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
        
        
        


        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })

    test("Authorized user cant post a cookingTime as a string recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: "testytesty",
                    cookingTimeMinutes: "dluugo",
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: ['milosc'],
                    categories: ['najlepsze']
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
        
        
        


        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })

    test("Authorized user cant post ingredients as a number[] recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: "testytesty",
                    cookingTimeMinutes: "dluugo",
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: [1,2,3],
                    categories: ['test','test']
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
    

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })

    test("Authorized user cant post more than 25 ingredients in a recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: "testytesty",
                    cookingTimeMinutes: "dluugo",
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: ['1','2','3','4','5','6','7','8','9',
                                    '10','11','12','13','14','15','16','17',
                                    '18','19','20','21','22','23','24','25'
                                    ,'26'],
                    categories: ['test','test'],
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
                
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })

    
    test("Authorized user cant post the same ingredients in a recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: "testytesty",
                    cookingTimeMinutes: "dluugo",
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: ['aaa','aaa','aaa'],
                    categories: ['test'],
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
                
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })

    test("Authorized user cant post the same categories in a recipe", async () => {
        const response = await supertest(app).post("/recipe").send(
                {
                    title: "testytesty",
                    cookingTimeMinutes: "dluugo",
                    description: "Sekretnym składnikiem jest miłość.",
                    isPublic: true,
                    ingredients: ['aaa'],
                    categories: ['test','test'],
                }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        
                
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);


    })
})