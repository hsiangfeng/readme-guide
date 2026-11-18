import express from 'express';
import { menu } from './routes/menu.js';

const app = express();
app.use('/api/menu', menu);
app.listen(process.env.PORT || 3000);
