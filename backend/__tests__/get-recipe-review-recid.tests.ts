import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';
import config from '../config';

describe("GET /recipe/review/recipeid", () => {

    test("Unauthorized - should respond with a 401 status code", async () => {
        const response = await supertest(app).get("/recipe/review/21")

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ success: false, msg: 'Unauthorized' });
    })

    test("Authorized user can get other users public recipes reviews", async () => {
        const response = await supertest(app).get("/recipe/review/21"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 25
        })        

        
        
        // expect(response.status).toBe(200);
        // expect(response.body.success).toBe(true);
        // expect(response.body.msg).toBe("Paginated reviews fetched successfully");

        const bodyProperties = ['page','limit','totalReviews', 'totalPages',
                                'currentUserReview', 'reviews']
        
        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const reviewProperties = ['author', 'id', 'stars', 'comment', 'recipeId',
                                   'userId', 'createdAt']

        for (const review of response.body.reviews) {
            expect(review.stars).toBeGreaterThan(1)
            expect(review.stars).toBeLessThan(6)

            for (const property of reviewProperties)
                expect(review).toHaveProperty(property)
        }
    })

    test("Authorized user cant get other users private recipes reviews", async () => {
        const response = await supertest(app).get("/recipe/review/35"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 25
        })        

        
        
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        //more
    })
    
    test("Authorized user can get his public recipes reviews", async () => {
        const response = await supertest(app).get("/recipe/review/62"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 25
        })        

        
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const bodyProperties = ['page','limit','totalReviews', 'totalPages',
        'currentUserReview', 'reviews']

        for (const property of bodyProperties) {
            expect(response.body).toHaveProperty(property);
        }

        const reviewProperties = ['author', 'id', 'stars', 'comment', 'recipeId',
                'userId', 'createdAt']

        for (const review of response.body.reviews) {
            expect(review.stars).toBeGreaterThan(0)
            expect(review.stars).toBeLessThan(6)

            for (const property of reviewProperties)
                expect(review).toHaveProperty(property)
}
    })

    test("Authorized user can fetch no reviews for his recipe", async () => {
        const response = await supertest(app).get("/recipe/review/63"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 25
        })        

        
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.totalPages).toBe(0);
        expect(response.body.totalReviews).toBe(0);
        expect(response.body.msg).toBe("No more pages");
        expect(response.body.currentLoggedUserId).toBe(undefined);
        expect(response.body.reviews).toStrictEqual([]);
    })

    test("Authorized user cant fetch no more than 25 reviews", async () => {
        const response = await supertest(app).get("/recipe/review/63"
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 30
        })        

        
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.totalPages).toBe(0);
        expect(response.body.totalReviews).toBe(0);
        expect(response.body.msg).toBe("No more pages");
        expect(response.body.currentLoggedUserId).toBe(undefined);
        expect(response.body.reviews).toStrictEqual([]);
    })

    test("Authorized user cant get his private recipe reviews", async () => {
        const recipeId = 67;
        const response = await supertest(app).get(`/recipe/review/${recipeId}`
        ).set('Authorization', `Bearer ${config.TEST.ACCESS_TOKEN}`)
        .query({
            page: 1,
            limit: 25
        })        

        
        
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.totalPages).toBe(undefined);
        expect(response.body.totalReviews).toBe(undefined);
        expect(response.body.msg).toBe(`Recipe with ID of ${recipeId} not found.`);
        expect(response.body.currentLoggedUserId).toBe(undefined);
        expect(response.body.reviews).toBe(undefined);
    })


})