import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';

describe("PUT /recipe/review/reviewid", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).put("/recipe/review/21")

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    // test("Authorized user can edit his review on others users public recipes", async () => {
    //     const checkRecipeReview = await supertest(app).get("/recipe/review/21"
    //     ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
    //     .query({
    //         page: 1,
    //         limit: 25
    //     })
    //
    //     if (!checkRecipeReview.body.currentUserReview) {
    //         const postedReview = await supertest(app).post(`/recipe/review/21`
    //     ).send({
    //         stars: 3,
    //         comment: 'test'
    //     })
    //     .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
    //     }
    //
    //     const getRecipeReview = await supertest(app).get("/recipe/review/21"
    //     ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
    //     .query({
    //         page: 1,
    //         limit: 25
    //     })
    //
    //
    //     const reviewIdToPut = getRecipeReview.body.currentUserReview.id
    //
    //     const response = await supertest(app).put(`/recipe/review/${reviewIdToPut}`
    //     ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
    //     .send({
    //         stars: 5,
    //         comment: 'great'
    //     })
    //
    //     console.log(response.status);
    //
    //     expect(response.status).toBe(200);
    //     expect(response.body.success).toBe(true);
    //
    //
    // })
})