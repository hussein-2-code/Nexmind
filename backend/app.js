//THIS IS THE EXPRESS RELATED FILE
//ALL THINGS EXPRESS HERE
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require("cors");

const AppError = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const projectRouter = require('./routes/projectRoutes');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');

const app = express();

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request, try again in an hour.',
});
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite React app
  credentials: true, // Allow cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS',"PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
////GLOBAL MIDDLWARES
//set security http
app.use(helmet());

//dev logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
//limit request from same IP
app.use('/api', limiter);
//body parser, reading data from the req.body
app.use(express.json({ limit: '10kb' }));
//data sanitization against NoSQL query injector
app.use(mongoSanitize());
//data sanitizaion against XSS attacks
//-->look for something to replace old xss-clean
//prevent parameter polution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverge',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);
//serving static files
app.use(express.static(`${__dirname}/public`));
//test middleware
app.use((req, res, next) => {
    // console.log(req.headers);
    next();
});
app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
