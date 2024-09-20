export interface Task {
  _id: string;
  name: string,
  description: string;
  isImportant: boolean;
  isCompleted: boolean;
  deleted?: boolean;
  editable?: boolean;
}
