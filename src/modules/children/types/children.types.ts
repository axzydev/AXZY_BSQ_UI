export interface Children {
  id: number;
  name: string;
  lastName: string;
  birthDate: string; // ISO string: "2025-12-11T20:52:54.503Z"
  userId: number;
  appointments?: any[];
}

export interface ChildrenCreate {
  name: string;
  lastName: string;
  birthDate: string; // ISO string: "2025-12-11T20:52:54.503Z"
  userId: number;
}

export interface ChildrenUpdate {
  name?: string;
  lastName?: string;
  birthDate?: string;
}

export interface AssignTrainingMode {
  userId: number;
  childId: number;
  trainingModeId: string; // From form (likely string)
  dayScheduleId: number;
}