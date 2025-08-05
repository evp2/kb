import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { insertColumnSchema, insertTaskSchema } from '@shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Column routes
  app.get('/api/columns', async (req, res) => {
    try {
      const columns = await storage.getColumns();
      res.json(columns);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch columns' });
    }
  });

  app.post('/api/columns', async (req, res) => {
    try {
      const validatedData = insertColumnSchema.parse(req.body);
      console.log('Column Data:', validatedData);
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

  app.put('/api/columns/:id', async (req, res) => {
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

  app.delete('/api/columns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteColumn(id);

      if (!success) {
        return res.status(404).json({ message: 'Column not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete column' });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/column/:columnId', async (req, res) => {
    try {
      const columnId = parseInt(req.params.columnId);
      const tasks = await storage.getTasksByColumn(columnId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
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

  app.put('/api/tasks/:id', async (req, res) => {
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

  app.delete('/api/tasks/:id', async (req, res) => {
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

  app.put('/api/tasks/:id/move', async (req, res) => {
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

  app.put('/api/columns/:id/move', async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
