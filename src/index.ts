import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
