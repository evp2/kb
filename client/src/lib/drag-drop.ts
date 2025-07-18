import { useDrag, useDrop } from "react-dnd";
import { Task } from "@shared/schema";

export const ItemTypes = {
  TASK: "task",
};

export interface DragItem {
  id: number;
  type: string;
  columnId: number;
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

export function useDropColumn(
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
