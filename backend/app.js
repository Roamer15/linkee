import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import winstonLogger from './utils/logger.js'
import morgan from 'morgan'
import swaggerUi from "swagger-ui-express"
import swaggerSpec from './config/swaggerConfig.js'

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

const morganFormat = process.env.NODE_ENV === "production" ? "dev" : 'combined'
app.use(morgan(morganFormat, { stream: winstonLogger.stream }));
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default app;
