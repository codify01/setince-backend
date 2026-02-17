import express from 'express';
import cors from 'cors';
import { mongooseConfig } from './src/config/mongoose';
import authRouter from './src/routes/auth.routes'
import placesRouter from './src/routes/places.routes';
import itineraryRouter from './src/routes/itinerary.routes';
import userRouter from './src/routes/user.routes';
import tabsRouter from './src/routes/tabs.routes';
import categoriesRouter from './src/routes/categories.routes';
import reviewsRouter from './src/routes/reviews.routes';
import cityRouter from './src/routes/city.routes';
import tripRouter from './src/routes/trip.routes';
import aiRouter from './src/routes/ai.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger';



const app = express();
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (_req, res) => {
  res.send('Hello, Setince!');
});

app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.use('/api/auth', authRouter);
app.use('/api/itineraries', itineraryRouter);
app.use('/api/users', userRouter);
app.use('/api/places', placesRouter);
app.use('/api/tabs', tabsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/cities', cityRouter);
app.use('/api/trips', tripRouter);
app.use('/api/ai', aiRouter);

mongooseConfig();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
