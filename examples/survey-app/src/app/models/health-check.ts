export interface HealthCheck {
  isHealthy: boolean;
  status: string;
  finishedAt: string;
  debugInfo: DebugInfo;
  checks: HealthCheckItem[];
}

interface HealthCheckItem {
  name: string;
  isCached: boolean;
  message: string;
  status: string;
  finishedAt: string;
  meta?: {
    sizeInPercentage?: number;
    failureThreshold?: number;
    used?: number;
    warningThreshold?: number;
  };
}

interface DebugInfo {
  pid: number;
  platform: string;
  ppid: number;
  uptime: number;
  version: string;
}
