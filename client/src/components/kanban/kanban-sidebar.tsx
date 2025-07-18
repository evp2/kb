
import { Plus, Columns } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface KanbanSidebarProps {
  onAddTask: () => void;
  onAddColumn: () => void;
}

export default function KanbanSidebar({ onAddTask, onAddColumn }: KanbanSidebarProps) {
  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onAddTask} className="w-full">
                  <Plus size={16} />
                  <span>Add Task</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onAddColumn} className="w-full">
                  <Columns size={16} />
                  <span>Add Column</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
