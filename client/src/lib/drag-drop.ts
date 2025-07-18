import { useDrag, useDrop } from "react-dnd";
import { Task } from "@shared/schema";

export const ItemTypes = {
  TASK: "task",
  COLUMN: "column",
};

export interface DragItem {
  id: number;
  type: string;
  columnId: number;
  position: number;
}

export interface ColumnDragItem {
  id: number;
  type: string;
  position: number;
}

export function useDragTask(task: Task) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: {
      id: task.id,
      type: ItemTypes.TASK,
      columnId: task.columnId,
      position: task.position,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return { isDragging, drag };
}

export function useDropTask(
  columnId: number,
  onMoveTask: (taskId: number, targetColumnId: number, targetPosition: number) => void
) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: DragItem) => {
      if (item.columnId !== columnId) {
        onMoveTask(item.id, columnId, 0);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return { isOver, canDrop, drop };
}

export function useDragColumn(column: { id: number; position: number }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COLUMN,
    item: {
      id: column.id,
      type: ItemTypes.COLUMN,
      position: column.position,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return { isDragging, drag };
}

export function useDropColumn(
  position: number,
  onMoveColumn: (columnId: number, targetPosition: number) => void
) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.COLUMN,
    drop: (item: ColumnDragItem) => {
      if (item.position !== position) {
        onMoveColumn(item.id, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return { isOver, canDrop, drop };
}
