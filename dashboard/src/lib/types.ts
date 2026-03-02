export type StackStatus = "stopped" | "starting" | "running" | "stopping" | "error";
export type Language = "Go" | "Rust" | "Java" | "Kotlin" | "Node.js" | "Python";

export interface StackMeta {
  name: string;
  language: Language;
  framework: string;
  version: string;
  orm: string;
  isUnified: boolean;
  githubBranch: string;
  stackDir: string;
}

export interface PortAllocation {
  stackName: string;
  backendPort: number;
  frontendPort: number;
  allocatedAt: string;
}

export interface PortsState {
  allocations: PortAllocation[];
}

export interface StackInfo extends StackMeta {
  status: StackStatus;
  ports: PortAllocation | null;
  errorMessage: string | null;
}

export interface StartResponse {
  ok: boolean;
  message: string;
  ports: PortAllocation;
}

export interface StopResponse {
  ok: boolean;
  message: string;
}

export interface StatusResponse {
  status: StackStatus;
  ports: PortAllocation | null;
  healthy: boolean;
  errorMessage: string | null;
}

export interface ProxyRequest {
  endpoint: string;
  method: string;
  body?: string;
}

export interface ProxyResponse {
  ok: boolean;
  status: number;
  data: unknown;
  durationMs: number;
  error?: string;
}
