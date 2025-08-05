import {
  boolean,
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  smallserial,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const assigneesEnum = z.enum(['Evan P']);
export const colorEnum = z.enum(['gray', 'blue', 'green', 'red', 'orange', 'yellow', 'purple']);
export const priorityEnum = z.enum(['low', 'medium', 'high']);

export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  color: text('color').notNull().default('blue'),
  position: integer('position').notNull(),
  showSlider: integer('show_slider').notNull().default(0),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').notNull().default('medium'),
  columnId: integer('column_id').notNull(),
  position: integer('position').notNull(),
  progress: integer('progress').notNull().default(0),
  assignees: text('assignees'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  taskId: integer('task_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertColumnSchema = createInsertSchema(columns).omit({
  id: true,
}).extend({
  color: colorEnum.optional(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  priority: priorityEnum.optional(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type Column = typeof columns.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
