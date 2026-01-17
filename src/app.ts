import express, { Request, Response } from 'express';
import usersRouter from './routes/users';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Express server!');
});

app.use('/api/users', usersRouter);

export { app };
