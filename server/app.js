// app.js
// Mount all routers under /api. Apply express.json(), cors, helmet, morgan. Mount errorHandler last. 
// Export the app (not listen — that goes in server.js).
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import agentRoutes from './routes/agent.js';
import discoverRoutes from './routes/discover.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(logger);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/jobs', discoverRoutes);

app.use(errorHandler);

export default app;