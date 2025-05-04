// server/src/routes/hello.ts
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: '🍎 Hello from Express API!' });
});

export default router;
