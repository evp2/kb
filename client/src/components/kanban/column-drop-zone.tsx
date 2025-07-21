import { useDropColumn } from '@/lib/drag-drop';
import { cn } from '@/lib/utils';

interface ColumnDropZoneProps {
  position: number;
  onMoveColumn: (columnId: number, targetPosition: number) => void;
  children: React.ReactNode;
}

export default function ColumnDropZone({
  position,
  onMoveColumn,
  children,
}: ColumnDropZoneProps) {
  const { isOver, canDrop, drop } = useDropColumn(position, onMoveColumn);

  return (
    <div
      ref={drop}
      className={cn(
        'relative',
        isOver &&
          canDrop &&
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500 before:rounded-full before:z-10'
      )}
    >
      {children}
    </div>
  );
}
