export interface Task {
  _id: string;
  description: string;
  isImportant: boolean;
  isCompleted: boolean;
  isDeleted?: boolean;
}
