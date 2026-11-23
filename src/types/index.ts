export type AgentRole = "ORCHESTRATOR" | "DEVELOP" | "TESTING";

export type AgentStatus =
  | "idle"
  | "thinking"
  | "active"
  | "reviewing"
  | "retrying"
  | "completed"
  | "error";

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "TESTING"
  | "RETRYING"
  | "PASSED"
  | "FAILED";

export interface IArtifact {
  id?: string;
  projectId: string;
  taskId?: string;
  fileName: string;
  content: string;
  language: string;
  version?: number;
  createdAt?: string;
}

export interface ITask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  order: number;
  assignedTo: "DEVELOP" | "TESTING";
  status: TaskStatus;
  iterations: number;
  testCriteria?: string[];
  createdAt?: string;
  updatedAt?: string;
  artifacts?: IArtifact[];
}

export interface IAgentLog {
  id?: string;
  projectId: string;
  agent: AgentRole;
  type: "thought" | "action" | "code" | "test_result" | "feedback" | "error" | "status";
  content: string;
  meta?: Record<string, unknown> | null;
  createdAt?: string;
}

export interface IProject {
  id: string;
  title: string;
  prompt: string;
  status: "idle" | "planning" | "in_progress" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  tasks?: ITask[];
  logs?: IAgentLog[];
  artifacts?: IArtifact[];
}

export interface TestFailure {
  testName: string;
  file: string;
  line?: number;
  errorMessage: string;
  suggestion: string;
}

export interface TestResultReport {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failures: TestFailure[];
  summary: string;
  coverage?: string;
}

export interface StreamEvent {
  type:
    | "project_created"
    | "agent_status"
    | "log"
    | "plan_ready"
    | "task_started"
    | "task_status"
    | "artifact_created"
    | "test_completed"
    | "feedback_loop"
    | "project_completed"
    | "error";
  agent?: AgentRole;
  status?: AgentStatus;
  log?: IAgentLog;
  task?: ITask;
  tasks?: ITask[];
  artifact?: IArtifact;
  testReport?: TestResultReport;
  project?: IProject;
  message?: string;
}
