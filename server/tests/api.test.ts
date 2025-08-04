
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';

describe('Kanban API Tests', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('Column API', () => {
    describe('GET /api/columns', () => {
      it('should return all columns sorted by position', async () => {
        const response = await request(app)
          .get('/api/columns')
          .expect(200);

        expect(response.body).toHaveLength(4);
        expect(response.body[0].title).toBe('To Do');
        expect(response.body[0].position).toBe(0);
        expect(response.body[3].title).toBe('Done');
        expect(response.body[3].position).toBe(3);

        // Verify columns are sorted by position
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].position).toBeLessThan(response.body[i + 1].position);
        }
      });
    });

    describe('POST /api/columns', () => {
      it('should create a new column at the end of the board', async () => {
        const newColumn = {
          title: 'Review',
          color: 'purple',
          position: 4,
          showSlider: true
        };

        const response = await request(app)
          .post('/api/columns')
          .send(newColumn)
          .expect(201);

        expect(response.body.title).toBe('Review');
        expect(response.body.position).toBe(4);
        expect(response.body.id).toBeDefined();

        // Verify it appears at the end
        const allColumns = await request(app).get('/api/columns');
        const lastColumn = allColumns.body[allColumns.body.length - 1];
        expect(lastColumn.title).toBe('Review');
      });

      it('should enforce business rule: new columns always append to end regardless of position value', async () => {
        const newColumn1 = {
          title: 'First New Column',
          color: 'red',
          position: 99, // Intentionally high position
          showSlider: false
        };

        const newColumn2 = {
          title: 'Second New Column',
          color: 'blue',
          position: 1, // Intentionally low position
          showSlider: true
        };

        // Create first column
        await request(app)
          .post('/api/columns')
          .send(newColumn1)
          .expect(201);

        // Create second column
        await request(app)
          .post('/api/columns')
          .send(newColumn2)
          .expect(201);

        // Verify both columns are at the end in order of creation
        const allColumns = await request(app).get('/api/columns');
        const columns = allColumns.body;
        
        expect(columns[columns.length - 2].title).toBe('First New Column');
        expect(columns[columns.length - 1].title).toBe('Second New Column');
      });

      it('should validate required fields', async () => {
        const invalidColumn = {
          color: 'blue',
          position: 0,
          showSlider: true
          // Missing title
        };

        await request(app)
          .post('/api/columns')
          .send(invalidColumn)
          .expect(400);
      });

      it('should validate color enum values', async () => {
        const invalidColumn = {
          title: 'Test Column',
          color: 'invalid-color',
          position: 0,
          showSlider: true
        };

        await request(app)
          .post('/api/columns')
          .send(invalidColumn)
          .expect(400);
      });

      it('should set default values correctly', async () => {
        const minimalColumn = {
          title: 'Minimal Column',
          position: 0
        };

        const response = await request(app)
          .post('/api/columns')
          .send(minimalColumn)
          .expect(201);

        expect(response.body.color).toBe('blue');
        expect(response.body.showSlider).toBe(false);
      });
    });

    describe('PUT /api/columns/:id', () => {
      it('should update column properties', async () => {
        const updates = {
          title: 'Updated Title',
          color: 'red'
        };

        const response = await request(app)
          .put('/api/columns/1')
          .send(updates)
          .expect(200);

        expect(response.body.title).toBe('Updated Title');
        expect(response.body.color).toBe('red');
        expect(response.body.id).toBe(1);
      });

      it('should return 404 for non-existent column', async () => {
        const updates = { title: 'Test' };

        await request(app)
          .put('/api/columns/999')
          .send(updates)
          .expect(404);
      });
    });

    describe('DELETE /api/columns/:id', () => {
      it('should delete column and move tasks to first available column', async () => {
        // First, verify there are tasks in column 2
        const tasksInColumn2 = await request(app).get('/api/tasks/column/2');
        expect(tasksInColumn2.body.length).toBeGreaterThan(0);

        // Delete column 2
        await request(app)
          .delete('/api/columns/2')
          .expect(204);

        // Verify column is deleted
        const columns = await request(app).get('/api/columns');
        const columnIds = columns.body.map((col: any) => col.id);
        expect(columnIds).not.toContain(2);

        // Verify tasks were moved to another column
        const allTasks = await request(app).get('/api/tasks');
        const tasksFromDeletedColumn = allTasks.body.filter((task: any) => task.columnId === 2);
        expect(tasksFromDeletedColumn).toHaveLength(0);
      });

      it('should return 404 for non-existent column', async () => {
        await request(app)
          .delete('/api/columns/999')
          .expect(404);
      });
    });

    describe('PUT /api/columns/:id/move', () => {
      it('should move column to new position', async () => {
        const response = await request(app)
          .put('/api/columns/1/move')
          .send({ position: 2 })
          .expect(200);

        expect(response.body.position).toBe(2);

        // Verify other columns positions were adjusted
        const allColumns = await request(app).get('/api/columns');
        const sortedColumns = allColumns.body.sort((a: any, b: any) => a.position - b.position);
        
        // Verify positions are sequential and correct
        sortedColumns.forEach((col: any, index: number) => {
          expect(col.position).toBe(index);
        });
      });

      it('should validate position parameter', async () => {
        await request(app)
          .put('/api/columns/1/move')
          .send({ position: 'invalid' })
          .expect(400);
      });
    });
  });

  describe('Task API', () => {
    describe('GET /api/tasks', () => {
      it('should return all tasks', async () => {
        const response = await request(app)
          .get('/api/tasks')
          .expect(200);

        expect(response.body).toHaveLength(9);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('columnId');
      });
    });

    describe('GET /api/tasks/column/:columnId', () => {
      it('should return tasks for specific column sorted by position', async () => {
        const response = await request(app)
          .get('/api/tasks/column/1')
          .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach((task: any) => {
          expect(task.columnId).toBe(1);
        });

        // Verify tasks are sorted by position
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].position).toBeLessThanOrEqual(response.body[i + 1].position);
        }
      });

      it('should return empty array for column with no tasks', async () => {
        // Create a new column
        const newColumn = await request(app)
          .post('/api/columns')
          .send({
            title: 'Empty Column',
            color: 'gray',
            position: 5,
            showSlider: false
          });

        const response = await request(app)
          .get(`/api/tasks/column/${newColumn.body.id}`)
          .expect(200);

        expect(response.body).toHaveLength(0);
      });
    });

    describe('POST /api/tasks', () => {
      it('should create a new task', async () => {
        const newTask = {
          title: 'New Test Task',
          description: 'Test description',
          priority: 'high',
          columnId: 1,
          position: 0,
          progress: 0,
          assignees: 'Evan P'
        };

        const response = await request(app)
          .post('/api/tasks')
          .send(newTask)
          .expect(201);

        expect(response.body.title).toBe('New Test Task');
        expect(response.body.columnId).toBe(1);
        expect(response.body.id).toBeDefined();
        expect(response.body.createdAt).toBeDefined();
      });

      it('should validate required fields', async () => {
        const invalidTask = {
          description: 'Missing title and columnId',
          priority: 'medium'
        };

        await request(app)
          .post('/api/tasks')
          .send(invalidTask)
          .expect(400);
      });

      it('should set default values', async () => {
        const minimalTask = {
          title: 'Minimal Task',
          columnId: 1,
          position: 0
        };

        const response = await request(app)
          .post('/api/tasks')
          .send(minimalTask)
          .expect(201);

        expect(response.body.priority).toBe('medium');
        expect(response.body.progress).toBe(0);
      });
    });

    describe('PUT /api/tasks/:id', () => {
      it('should update task properties', async () => {
        const updates = {
          title: 'Updated Task Title',
          priority: 'high',
          progress: 3
        };

        const response = await request(app)
          .put('/api/tasks/1')
          .send(updates)
          .expect(200);

        expect(response.body.title).toBe('Updated Task Title');
        expect(response.body.priority).toBe('high');
        expect(response.body.progress).toBe(3);
      });

      it('should return 404 for non-existent task', async () => {
        await request(app)
          .put('/api/tasks/999')
          .send({ title: 'Test' })
          .expect(404);
      });
    });

    describe('PUT /api/tasks/:id/move', () => {
      it('should move task to different column and position', async () => {
        const response = await request(app)
          .put('/api/tasks/1/move')
          .send({ columnId: 2, position: 0 })
          .expect(200);

        expect(response.body.columnId).toBe(2);
        expect(response.body.position).toBe(0);
      });

      it('should validate move parameters', async () => {
        await request(app)
          .put('/api/tasks/1/move')
          .send({ columnId: 'invalid', position: 0 })
          .expect(400);

        await request(app)
          .put('/api/tasks/1/move')
          .send({ columnId: 2, position: 'invalid' })
          .expect(400);
      });

      it('should return 404 for non-existent task', async () => {
        await request(app)
          .put('/api/tasks/999/move')
          .send({ columnId: 2, position: 0 })
          .expect(404);
      });
    });

    describe('DELETE /api/tasks/:id', () => {
      it('should delete task', async () => {
        await request(app)
          .delete('/api/tasks/1')
          .expect(204);

        // Verify task is deleted
        const allTasks = await request(app).get('/api/tasks');
        const taskIds = allTasks.body.map((task: any) => task.id);
        expect(taskIds).not.toContain(1);
      });

      it('should return 404 for non-existent task', async () => {
        await request(app)
          .delete('/api/tasks/999')
          .expect(404);
      });
    });
  });

  describe('Business Logic Integration Tests', () => {
    it('should maintain column position integrity when adding multiple columns', async () => {
      const initialColumns = await request(app).get('/api/columns');
      const initialCount = initialColumns.body.length;

      // Add three new columns
      const columns = [
        { title: 'Backlog', color: 'gray', position: 10, showSlider: false },
        { title: 'Code Review', color: 'yellow', position: 5, showSlider: true },
        { title: 'QA Testing', color: 'orange', position: 1, showSlider: true }
      ];

      for (const column of columns) {
        await request(app)
          .post('/api/columns')
          .send(column)
          .expect(201);
      }

      // Verify all columns maintain sequential positions
      const finalColumns = await request(app).get('/api/columns');
      expect(finalColumns.body).toHaveLength(initialCount + 3);

      // Check that positions are sequential starting from 0
      finalColumns.body.forEach((col: any, index: number) => {
        expect(col.position).toBe(index);
      });

      // Verify new columns appear at the end in creation order
      const newColumnTitles = finalColumns.body.slice(-3).map((col: any) => col.title);
      expect(newColumnTitles).toEqual(['Backlog', 'Code Review', 'QA Testing']);
    });

    it('should handle task movement between columns correctly', async () => {
      // Get initial state
      const initialTasks = await request(app).get('/api/tasks/column/1');
      const taskToMove = initialTasks.body[0];

      // Move task to different column
      await request(app)
        .put(`/api/tasks/${taskToMove.id}/move`)
        .send({ columnId: 3, position: 0 })
        .expect(200);

      // Verify task is no longer in original column
      const originalColumnTasks = await request(app).get('/api/tasks/column/1');
      const taskIds = originalColumnTasks.body.map((task: any) => task.id);
      expect(taskIds).not.toContain(taskToMove.id);

      // Verify task is in new column
      const newColumnTasks = await request(app).get('/api/tasks/column/3');
      const movedTask = newColumnTasks.body.find((task: any) => task.id === taskToMove.id);
      expect(movedTask).toBeDefined();
      expect(movedTask.columnId).toBe(3);
    });

    it('should maintain data consistency when deleting columns with tasks', async () => {
      // Get tasks in column before deletion
      const tasksBeforeDeletion = await request(app).get('/api/tasks/column/2');
      const taskIds = tasksBeforeDeletion.body.map((task: any) => task.id);

      // Delete the column
      await request(app)
        .delete('/api/columns/2')
        .expect(204);

      // Verify all tasks still exist but moved to different columns
      const allTasks = await request(app).get('/api/tasks');
      for (const taskId of taskIds) {
        const task = allTasks.body.find((t: any) => t.id === taskId);
        expect(task).toBeDefined();
        expect(task.columnId).not.toBe(2); // Should be moved to different column
      }
    });
  });
});
