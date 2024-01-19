import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';

describe("DELETE /recipe/review/reviewid", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).put("/recipe/review/21")

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user can delete his own review", async () => {
        const checkRecipeReview = await supertest(app).get("/recipe/review/21"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 15
        })


        if (checkRecipeReview.body?.currentUserReview.id == null) {
            const postedReview = await supertest(app).post(`/recipe/review/21`
        ).send({
            stars: 3,
            comment: 'test'
        })
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        }

        const getRecipeReview = await supertest(app).get("/recipe/review/21"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 15
        })

        console.log(getRecipeReview.body);
        
        
        const reviewIdToDelete = getRecipeReview.body.currentUserReview.id
        
        const response = await supertest(app).delete(`/recipe/review/${reviewIdToDelete}`
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe("Review deleted successfully");

        
        

    })
})
