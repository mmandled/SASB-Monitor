import { Router, type Request, type Response } from 'express';
import { cacheService } from '../services/cacheService.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRouter.get('/config/status', (_req: Request, res: Response) => {
  try {
    const status = cacheService.getConfigStatus();
    res.json(status);
  } catch (err: any) {
    console.error('[API /config/status Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve configuration status' });
  }
});

const handleSync = async (_req: Request, res: Response) => {
  try {
    const result = await cacheService.sync();
    res.json(result);
  } catch (err: any) {
    console.error('[API /sync Error]:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Unable to sync ClickUp data. Please check API token and workspace access.'
    });
  }
};

apiRouter.get('/sync', handleSync);
apiRouter.post('/sync', handleSync);

apiRouter.get('/dashboard', (req: Request, res: Response) => {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : undefined;
    const memberId = typeof req.query.memberId === 'string' ? req.query.memberId : undefined;
    const status = (req.query.status === 'completed' || req.query.status === 'active')
      ? req.query.status
      : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const summary = cacheService.getDashboard({
      month,
      memberId,
      status,
      search
    });

    res.json(summary);
  } catch (err: any) {
    console.error('[API /dashboard Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

apiRouter.get('/members', (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const members = cacheService.getMembers(search);
    res.json({ members, count: members.length });
  } catch (err: any) {
    console.error('[API /members Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

apiRouter.get('/members/:memberId', (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member = cacheService.getMemberById(memberId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (err: any) {
    console.error('[API /members/:id Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve member details' });
  }
});

apiRouter.get('/tasks', (req: Request, res: Response) => {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : undefined;
    const memberId = typeof req.query.memberId === 'string' ? req.query.memberId : undefined;
    const status = (req.query.status === 'completed' || req.query.status === 'active')
      ? req.query.status
      : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const tasks = cacheService.getTasks({
      month,
      memberId,
      status,
      search
    });

    res.json({ tasks, count: tasks.length });
  } catch (err: any) {
    console.error('[API /tasks Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

apiRouter.get('/months', (_req: Request, res: Response) => {
  try {
    const months = cacheService.getMonths();
    res.json({ months });
  } catch (err: any) {
    console.error('[API /months Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve months' });
  }
});
