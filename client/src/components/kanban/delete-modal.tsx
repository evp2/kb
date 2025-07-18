import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
}

export default function DeleteModal({ isOpen, onClose, taskId }: DeleteModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted successfully",
        description: "The task has been removed from the board.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelete = () => {
    if (taskId) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>

          <div className="flex space-x-3">
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteTaskMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
