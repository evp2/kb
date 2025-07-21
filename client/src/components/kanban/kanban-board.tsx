import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Column, Task } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import KanbanColumn from './kanban-column';
import ColumnDropZone from './column-drop-zone';

interface KanbanBoardProps {
  columns: Column[];
  tasks: Task[];
  onEditTask: (columnId: number, task?: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (columnId: number) => void;
}

export default function KanbanBoard({
  columns,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      columnId,
      position,
    }: {
      taskId: number;
      columnId: number;
      position: number;
    }) => {
      const response = await apiRequest('PUT', `/api/tasks/${taskId}/move`, {
        columnId,
        position,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Task moved successfully',
        description: 'The task has been moved to the new column.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error moving task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const moveColumnMutation = useMutation({
    mutationFn: async ({
      columnId,
      position,
    }: {
      columnId: number;
      position: number;
    }) => {
      const response = await apiRequest(
        'PUT',
        `/api/columns/${columnId}/move`,
        {
          position,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/columns'] });
      toast({
        title: 'Column moved successfully',
        description: 'The column has been reordered.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error moving column',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleMoveTask = (
    taskId: number,
    targetColumnId: number,
    targetPosition: number
  ) => {
    moveTaskMutation.mutate({
      taskId,
      columnId: targetColumnId,
      position: targetPosition,
    });
  };

  const handleMoveColumn = (columnId: number, targetPosition: number) => {
    moveColumnMutation.mutate({ columnId, position: targetPosition });
  };

  const getTasksForColumn = (columnId: number) => {
    return tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex space-x-6 overflow-x-auto min-h-screen">
        {columns.map((column, index) => (
          <ColumnDropZone
            key={column.id}
            position={index}
            onMoveColumn={handleMoveColumn}
          >
            <KanbanColumn
              column={column}
              tasks={getTasksForColumn(column.id)}
              onMoveTask={handleMoveTask}
              onMoveColumn={handleMoveColumn}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onAddTask={onAddTask}
            />
          </ColumnDropZone>
        ))}
      </div>
    </DndProvider>
  );
}
