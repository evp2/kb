import { Task } from '@shared/schema';
import { useDragTask } from '@/lib/drag-drop';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  showSlider?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  showSlider = true,
}: TaskCardProps) {
  const { isDragging, drag } = useDragTask(task);

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-green-100 text-green-800',
    };
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    };
    return texts[priority as keyof typeof texts] || 'Unknown Priority';
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Unknown';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getAssigneesList = (assignees: string | null) => {
    if (!assignees) return [];
    return assignees
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      ref={drag}
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 cursor-grab hover:shadow-md transition-all duration-200 group',
        isDragging && 'opacity-70 rotate-1 shadow-lg'
      )}
      draggable
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 flex-1 pr-2">{task.title}</h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-500 transition-colors p-1 h-6 w-6"
          >
            <Edit size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 h-6 w-6"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {showSlider && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">
              {task.progress != null ? task.progress * 20 : 0}%
            </span>
          </div>
          <Slider
            value={[task.progress != null ? task.progress : 0]}
            max={5}
            step={1}
            className="w-full"
            disabled
          />
        </div>
      )}

      {task.assignees && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Users size={12} className="text-gray-500" />
            <span className="text-xs text-gray-500">Assignees</span>
          </div>
          <div className="flex items-center space-x-1 flex-wrap">
            {getAssigneesList(task.assignees)
              .slice(0, 3)
              .map((assignee, index) => (
                <Avatar key={index} className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {getInitials(assignee)}
                  </AvatarFallback>
                </Avatar>
              ))}
            {getAssigneesList(task.assignees).length > 3 && (
              <span className="text-xs text-gray-500 ml-1">
                +{getAssigneesList(task.assignees).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full font-medium',
            getPriorityColor(task.priority)
          )}
        >
          {getPriorityText(task.priority)}
        </span>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock size={12} />
          <span>{formatTimeAgo(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
