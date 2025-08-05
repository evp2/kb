import {
  columns,
  tasks,
  users,
  type Column,
  type Task,
  type User,
  type InsertColumn,
  type InsertTask,
  type InsertUser,
} from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Column operations
  getColumns(): Promise<Column[]>;
  createColumn(column: InsertColumn): Promise<Column>;
  updateColumn(
    id: number,
    column: Partial<InsertColumn>
  ): Promise<Column | undefined>;
  deleteColumn(id: number): Promise<boolean>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTasksByColumn(columnId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  moveTask(
    taskId: number,
    newColumnId: number,
    newPosition: number
  ): Promise<Task | undefined>;
  moveColumn(
    columnId: number,
    newPosition: number
  ): Promise<Column | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private columns: Map<number, Column>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentColumnId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.columns = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentColumnId = 1;
    this.currentTaskId = 1;

    // Initialize with default columns
    this.initializeDefaultColumns();
    this.initializeDefaultTasks();
  }

  private initializeDefaultColumns() {
    const defaultColumns: Column[] = [
      {
        id: 1,
        title: 'To Do',
        color: 'gray',
        position: 0,
        showSlider: 1,
      },
      {
        id: 2,
        title: 'In Development',
        color: 'blue',
        position: 1,
        showSlider: 1,
      },
      {
        id: 3,
        title: 'In Testing',
        color: 'orange',
        position: 2,
        showSlider: 1,
      },
      {
        id: 4,
        title: 'Done',
        color: 'green',
        position: 3,
        showSlider: 0,
      },
    ];

    defaultColumns.forEach((column) => {
      this.columns.set(column.id, column);
    });
    this.currentColumnId = 4;
  }

  private initializeDefaultTasks() {
    const defaultTasks: Task[] = [
      {
        id: 1,
        title: 'Redesign user dashboard',
        description:
          'Update the main dashboard layout and improve user experience',
        priority: 'high',
        columnId: 1,
        position: 0,
        progress: 0,
        assignees: '',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        title: 'Update API documentation',
        description: 'Review and update all API endpoints documentation',
        priority: 'medium',
        columnId: 1,
        position: 1,
        progress: 0,
        assignees: '',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        title: 'Setup testing environment',
        description: 'Configure automated testing pipeline for the project',
        priority: 'low',
        columnId: 3,
        position: 1,
        progress: 4,
        assignees: 'Evan P',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 4,
        title: 'Implement user authentication',
        description: 'Add JWT authentication and secure login flow',
        priority: 'high',
        columnId: 2,
        position: 0,
        progress: 2,
        assignees: 'Evan P',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 5,
        title: 'Database optimization',
        description: 'Optimize database queries and add proper indexing',
        priority: 'medium',
        columnId: 2,
        position: 1,
        progress: 1,
        assignees: 'Evan P',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 6,
        title: 'Setup project structure',
        description: 'Initialize React project with all necessary dependencies',
        priority: 'low',
        columnId: 4,
        position: 0,
        progress: 5,
        assignees: 'Evan P',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 7,
        title: 'Design wireframes',
        description: 'Create initial wireframes for the application',
        priority: 'medium',
        columnId: 4,
        position: 1,
        progress: 5,
        assignees: 'Evan P',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 8,
        title: 'Setup Git repository',
        description: 'Initialize version control and setup GitHub repository',
        priority: 'low',
        columnId: 4,
        position: 2,
        progress: 5,
        assignees: 'Evan P',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 9,
        title: 'Research drag and drop libraries',
        description: 'Evaluate different drag and drop solutions for React',
        priority: 'medium',
        columnId: 4,
        position: 3,
        progress: 4,
        assignees: 'Evan P',
        createdAt: new Date(),
      },
    ];

    defaultTasks.forEach((task) => {
      this.tasks.set(task.id, task);
    });
    this.currentTaskId = 10;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Column operations
  async getColumns(): Promise<Column[]> {
    return Array.from(this.columns.values()).sort(
      (a, b) => a.position - b.position
    );
  }

  async createColumn(insertColumn: InsertColumn): Promise<Column> {
    const id = this.currentColumnId++;
    const column: Column = { ...insertColumn, id };
    this.columns.set(id, column);
    return column;
  }

  async updateColumn(
    id: number,
    updates: Partial<InsertColumn>
  ): Promise<Column | undefined> {
    const column = this.columns.get(id);
    if (!column) return undefined;

    const updatedColumn = { ...column, ...updates };
    this.columns.set(id, updatedColumn);
    return updatedColumn;
  }

  async deleteColumn(id: number): Promise<boolean> {
    // Move all tasks from this column to the first column
    const tasksToMove = Array.from(this.tasks.values()).filter(
      (task) => task.columnId === id
    );
    const firstColumn = Array.from(this.columns.values()).find(
      (col) => col.id !== id
    );

    if (firstColumn) {
      tasksToMove.forEach((task) => {
        this.tasks.set(task.id, { ...task, columnId: firstColumn.id });
      });
    }

    return this.columns.delete(id);
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort(
      (a, b) => a.position - b.position
    );
  }

  async getTasksByColumn(columnId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(
    id: number,
    updates: Partial<InsertTask>
  ): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async moveTask(
    taskId: number,
    newColumnId: number,
    newPosition: number
  ): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask = {
      ...task,
      columnId: newColumnId,
      position: newPosition,
    };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  async moveColumn(
    columnId: number,
    newPosition: number
  ): Promise<Column | undefined> {
    const column = this.columns.get(columnId);
    if (!column) return undefined;

    const allColumns = Array.from(this.columns.values()).sort(
      (a, b) => a.position - b.position
    );
    const oldPosition = column.position;

    // Update positions of other columns
    allColumns.forEach((col) => {
      if (col.id === columnId) {
        // Update the moved column
        this.columns.set(col.id, { ...col, position: newPosition });
      } else if (newPosition < oldPosition) {
        // Moving left: shift columns right
        if (col.position >= newPosition && col.position < oldPosition) {
          this.columns.set(col.id, { ...col, position: col.position + 1 });
        }
      } else {
        // Moving right: shift columns left
        if (col.position > oldPosition && col.position <= newPosition) {
          this.columns.set(col.id, { ...col, position: col.position - 1 });
        }
      }
    });

    return this.columns.get(columnId);
  }
}

export const storage = new MemStorage();
