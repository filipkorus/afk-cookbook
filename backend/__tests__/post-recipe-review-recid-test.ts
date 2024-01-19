import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';

describe("POST /recipe/review/recipeid", () => {


    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).post("/recipe/review/50")

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user can review someone's public recipe", async () => {
        const reviewId = 21;

        const recipeReviews = await supertest(app)
        .get(`/recipe/review/${reviewId}`).query({
            page: 1
        })
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`);

        if (recipeReviews.body.currentUserReview) {
            const reviewIdToDelete = recipeReviews.body.currentUserReview
            .id;

            const deleteReview = await supertest(app)
        .delete(`/recipe/review/${reviewIdToDelete}`)
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`);
            
        }

        const response = await supertest(app).post(`/recipe/review/${reviewId}`
        ).send({
            stars: 3,
            comment: 'test'
        })
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)    
        
        
        

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    })

    test("Authorized user cant review someone's private recipe", async () => {

        const response = await supertest(app).post("/recipe/review/35"
        ).send({
            stars: 3,
            comment: 'test'
        })
        .set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)    
        
        
        

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    })



})