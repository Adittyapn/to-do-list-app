export interface ChecklistItem {
  id: number;
  name: string;
  itemCompletionStatus: boolean;
}

export interface Checklist {
  id: number;
  name: string;
  items: ChecklistItem[];
}

export interface User {
  id: number;
  username: string;
  password?: string;
}
