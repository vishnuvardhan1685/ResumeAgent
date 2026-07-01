// app.js
// Mount all routers under /api. Apply express.json(), cors, helmet, morgan. Mount errorHandler last. 
// Export the app (not listen — that goes in server.js).
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './src/utils/logger.js';
import authRoutes from './src/routes/auth.js';
import jobRoutes from './src/routes/jobs.js';
import agentRoutes from './src/routes/agent.js';
import discoverRoutes from './src/routes/discover.js';
import resumeRoutes from './src/routes/resumes.js';
import userRoutes from './src/routes/users.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(logger);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/jobs/discover', discoverRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/user', userRoutes);

app.use(errorHandler);


export default app;
