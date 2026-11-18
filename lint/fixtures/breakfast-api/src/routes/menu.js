// 菜單：GET /api/menu
import { Router } from 'express';

export const menu = Router();
menu.get('/', (req, res) => res.json({ items: [] }));
