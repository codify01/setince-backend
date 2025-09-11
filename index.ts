import express from 'express';
import cors from 'cors';
import { mongooseConfig } from './src/config/mongoose';
import authRouter from './src/routes/auth.routes'
import placesRouter from './src/routes/places.routes';



const app = express();
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (_req, res) => {
  res.send('Hello, Setince!');
});



app.use('/api/auth', authRouter);
app.use('/api/itineraries', require('./src/routes/itinerary.routes').default);
app.use('/api/users', require('./src/routes/user.routes').default);
app.use('/api/places', placesRouter);

mongooseConfig();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
