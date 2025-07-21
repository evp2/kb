import { Column, Task } from '@shared/schema';
import { useDropTask, useDragColumn } from '@/lib/drag-drop';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import TaskCard from './task-card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onMoveTask: (
    taskId: number,
    targetColumnId: number,
    targetPosition: number
  ) => void;
  onMoveColumn: (columnId: number, targetPosition: number) => void;
  onEditTask: (columnId: number, task?: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (columnId: number) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onMoveTask,
  onMoveColumn,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: KanbanColumnProps) {
  const {
    isOver: isTaskOver,
    canDrop: canDropTask,
    drop: dropTask,
  } = useDropTask(column.id, onMoveTask);
  const { isDragging: isColumnDragging, drag: dragColumn } =
    useDragColumn(column);

  const getColumnIndicatorColor = (color: string) => {
    const colors = {
      gray: 'bg-gray-400',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-400';
  };

  const getColumnBadgeColor = (color: string) => {
    const colors = {
      gray: 'bg-gray-100 text-gray-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div
      ref={dragColumn}
      className={cn(
        'flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-200 cursor-move',
        isColumnDragging && 'opacity-50 transform rotate-2',
        'hover:shadow-md'
      )}
    >
      <div
        ref={dropTask}
        className={cn(
          'h-full',
          isTaskOver &&
            canDropTask &&
            'bg-blue-50 border-blue-300 border-2 border-dashed rounded-lg'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                getColumnIndicatorColor(column.color)
              )}
            />
            <h2 className="font-semibold text-gray-800">{column.title}</h2>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full',
                getColumnBadgeColor(column.color)
              )}
            >
              {tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>

        {/* Tasks Container */}
        <div className="space-y-3 min-h-[200px] pb-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(column.id, task)}
              onDelete={() => onDeleteTask(task.id)}
              showSlider={!!column.showSlider}
            />
          ))}
        </div>

        {/* Add Task Button */}
        <Button
          variant="outline"
          onClick={() => onAddTask(column.id)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add a task</span>
        </Button>
      </div>
    </div>
  );
}
