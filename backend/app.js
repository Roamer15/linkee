import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import winstonLogger from './utils/logger.js'
import morgan from 'morgan'
import swaggerUi from "swagger-ui-express"
import swaggerSpec from './config/swaggerConfig.js'
import cors from 'cors'

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
import logger from './utils/logger.js'

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://linkee-five.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false
}));

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
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


app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
