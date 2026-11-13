import express from 'express';
import authRoute from './route/authRoute.js'
import projectRoute from './route/projectRoute.js'

import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
// Routes
app.use('/api/auth', authRoute);
app.use('/api/projects', projectRoute)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

