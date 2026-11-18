// 放入測試用的菜單資料
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
await prisma.menuItem.createMany({ data: [{ name: '火腿蛋餅', price: 45 }] });
