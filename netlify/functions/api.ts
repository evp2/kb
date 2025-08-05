import serverless from 'serverless-http';
import express from 'express';

const app = express();
const router = express.Router();
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/.netlify/functions/api' : '/';
app.use(basePath, router);

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      console.log(logLine);
    }
  });

  next();
});

// Register routes without creating HTTP server
async function setupApp() {
  // Import registerRoutes but don't use the HTTP server creation part
  const { storage } = await import('../../server/storage');
  const { insertColumnSchema, insertTaskSchema } = await import(
    '@shared/schema'
  );
  const { z } = await import('zod');

  
  // Column routes
  router.get('/api/columns', async (req, res) => {
    try {
      const columns = await storage.getColumns();
      res.json(columns);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch columns' });
    }
  });

  router.post('/api/columns', async (req, res) => {
    try {
      const validatedData = insertColumnSchema.parse(req.body);
      const column = await storage.createColumn(validatedData);
      res.status(201).json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: 'Invalid column data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create column' });
      }
    }
  });

  router.put('/api/columns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertColumnSchema.partial().parse(req.body);
      const column = await storage.updateColumn(id, validatedData);

      if (!column) {
        return res.status(404).json({ message: 'Column not found' });
      }

      res.json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: 'Invalid column data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update column' });
      }
    }
  });

  router.delete('/api/columns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteColumn(id);

      if (!success) {
        return res.status(403).json({ message: 'Cannot delete column with tasks.' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete column' });
    }
  });

  // Task routes
  router.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  router.get('/api/tasks/column/:columnId', async (req, res) => {
    try {
      const columnId = parseInt(req.params.columnId);
      const tasks = await storage.getTasksByColumn(columnId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  router.post('/api/tasks', async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: 'Invalid task data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create task' });
      }
    }
  });

  router.put('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: 'Invalid task data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update task' });
      }
    }
  });

  router.delete('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);

      if (!success) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  router.put('/api/tasks/:id/move', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { columnId, position } = req.body;

      if (typeof columnId !== 'number' || typeof position !== 'number') {
        return res
          .status(400)
          .json({ message: 'Invalid columnId or position' });
      }

      const task = await storage.moveTask(id, columnId, position);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to move task' });
    }
  });

  router.put('/api/columns/:id/move', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { position } = req.body;

      if (typeof position !== 'number') {
        return res.status(400).json({ message: 'Invalid position' });
      }

      const column = await storage.moveColumn(id, position);

      if (!column) {
        return res.status(404).json({ message: 'Column not found' });
      }

      res.json(column);
    } catch (error) {
      res.status(500).json({ message: 'Failed to move column' });
    }
  });

  // Error handling middleware
  router.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      res.status(status).json({ message });
    }
  );
}

setupApp();

export default app;
export const handler = serverless(app);
