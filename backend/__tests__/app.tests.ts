import supertest from 'supertest'
import app from '../src/server'
import { describe, test, expect } from '@jest/globals';

describe("POST auth/login", () => {

    test("Should respond with a 200 status code", async () => {
        const response = await supertest(app).post("keepitrealnig").send({
            'name': 'Bob'}
        )
        expect(response.status).toBe(200);
    })

})