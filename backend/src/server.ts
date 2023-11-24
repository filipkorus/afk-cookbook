import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes/main.router';
import requestLogger from './middlewares/requestLogger';
import authenticate from './middlewares/authenticate';
import {NOT_FOUND} from './utils/httpCodeResponses/messages';
import config from '../config';

const app = express();

/* basic express config */
app.use(cors({
	origin: config.ALLOWED_ORIGINS.map(origin => new RegExp(`^${origin}`)),
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

/* custom middlewares */
app.use(authenticate);
app.use(requestLogger);

/* main router */
app.use('/', router);

/* 404 Not Found handler */
app.use('*', (req, res) => NOT_FOUND(res));

export default app;
