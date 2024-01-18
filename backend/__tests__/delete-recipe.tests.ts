import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';

describe("DELETE /recipe", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).delete("/recipe/21")

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user can delete his own recipe", async () => {
        const postRecipe = await supertest(app).post(`/recipe`).send(
            {
                title: "my recipe",
                cookingTimeMinutes: 40,
                description: "Sekretnym składnikiem jest miłość.",
                isPublic: true,
                ingredients: ['milosc'],
                categories: ['najlepsze']
            }
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)

        const idToDelete = postRecipe.body.data.recipe.id

        const response = await supertest(app).delete(`/recipe/${idToDelete}`
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    })

    test("Authorized user cant delete not his recipe", async () => {
        const response = await supertest(app).delete("/recipe/21"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    })

    test("Authorized user cant delete nonexistent recipe", async () => {
        const response = await supertest(app).delete("/recipe/9999991"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    })

    test("Authorized user cant delete string id recipe", async () => {
        const response = await supertest(app).delete("/recipe/dousuniecia"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    })

    test("Authorized user cant delete float id recipe", async () => {
        const response = await supertest(app).delete("/recipe/3.13"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)        

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    })

})