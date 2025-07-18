import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Column, Task } from "@shared/schema";
import KanbanBoard from "@/components/kanban/kanban-board";
import SearchBar from "@/components/kanban/search-bar";
import TaskModal from "@/components/kanban/task-modal";
import ColumnModal from "@/components/kanban/column-modal";
import DeleteModal from "@/components/kanban/delete-modal";
import { Button } from "@/components/ui/button";
import { Plus, Columns, Users, Menu } from "lucide-react";

export default function KanbanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  const { data: columns = [], isLoading: columnsLoading } = useQuery<Column[]>({
    queryKey: ["/api/columns"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenTaskModal = (columnId?: number, task?: Task) => {
    setSelectedColumnId(columnId || null);
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setSelectedColumnId(null);
  };

  const handleOpenDeleteModal = (taskId: number) => {
    setDeletingTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTaskId(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      setIsTaskModalOpen(true);
    }
    if (e.key === 'Escape') {
      setIsTaskModalOpen(false);
      setIsColumnModalOpen(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Add keyboard shortcuts
  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  if (columnsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kanban board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Menu className="text-white" size={16} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Kanban Board</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex items-center space-x-3">
              {/* Add Task Button */}
              <Button
                onClick={() => handleOpenTaskModal()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </Button>

              {/* Add Column Button */}
              <Button
                variant="outline"
                onClick={() => setIsColumnModalOpen(true)}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Columns size={16} />
                <span>Add Column</span>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="text-gray-600" size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <KanbanBoard
          columns={columns}
          tasks={filteredTasks}
          onEditTask={handleOpenTaskModal}
          onDeleteTask={handleOpenDeleteModal}
          onAddTask={handleOpenTaskModal}
        />
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={editingTask}
        columns={columns}
        selectedColumnId={selectedColumnId}
      />

      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        taskId={deletingTaskId}
      />
    </div>
  );
}
