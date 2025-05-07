import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename) 

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import authRouter from './routes/auth.js'
import shortenRouter from './routes/shorten.js'
import redirectionRouter from './routes/redirection.js'
import createdUrlsRouter from './routes/get-urls.js'

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter)
app.use('/api/shorten', shortenRouter)
app.use('/s', redirectionRouter)
app.use('/api/my-urls', createdUrlsRouter)

export default app;
