import type { VM, FleetUtilization, VMStatus } from "../types";

const mockVMs: VM[] = [
  {
    id: "vm-1", name: "dev-box-alpha", ownerId: "user-1", templateId: "tpl-1",
    status: "running", region: "us-east-1", createdAt: "2026-06-01T10:00:00Z",
    startedAt: "2026-06-25T08:00:00Z", lastActiveAt: "2026-06-25T13:40:00Z",
    cpuUsagePercent: 45, memoryUsagePercent: 60, diskUsagePercent: 30, hourlyCost: 0.05
  },
  {
    id: "vm-2", name: "data-cruncher", ownerId: "user-1", templateId: "tpl-2",
    status: "stopped", region: "us-west-2", createdAt: "2026-06-15T10:00:00Z",
    startedAt: null, lastActiveAt: "2026-06-24T18:00:00Z",
    cpuUsagePercent: 0, memoryUsagePercent: 0, diskUsagePercent: 80, hourlyCost: 0.15
  }
];

const mockFleetData: FleetUtilization = {
  period: "real-time", totalVms: 154, runningVms: 89, stoppedVms: 65, totalUsers: 42,
  avgCpuUtilizationPercent: 34, peakCpuUtilizationPercent: 92,
  avgMemoryUtilizationPercent: 55, peakMemoryUtilizationPercent: 88,
  totalHourlyCost: 12.45, monthToDateCost: 3450.20, projectedMonthlyCost: 4100.00
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchMyVMs = async (): Promise<VM[]> => {
  await delay(800);
  return mockVMs;
};

export const fetchFleetMetrics = async (): Promise<FleetUtilization> => {
  await delay(800);
  return mockFleetData;
};

export const toggleVmStatus = async (_vmId: string, action: "start" | "stop"): Promise<VMStatus> => {
  await delay(1000);
  return action === "start" ? "running" : "stopped";
};

export const fetchAllVMs = async (): Promise<VM[]> => {
  await delay(800);
  return [
    ...mockVMs,
    {
      id: "vm-3", name: "idle-test-box", ownerId: "user-2", templateId: "tpl-1",
      status: "running", region: "eu-central-1", createdAt: "2026-05-01T10:00:00Z",
      startedAt: "2026-06-01T08:00:00Z", lastActiveAt: "2026-06-10T13:40:00Z",
      cpuUsagePercent: 1, memoryUsagePercent: 5, diskUsagePercent: 15, hourlyCost: 0.05
    }
  ];
};

export const fetchTemplates = async () => {
  await delay(800);
  return [
    { id: 'tpl-1', name: 'Standard Developer', description: 'Default Node/React environment', vCpu: 4, memoryGb: 16, diskSizeGb: 50 },
    { id: 'tpl-2', name: 'Data Science Heavy', description: 'Python/Jupyter environment', vCpu: 16, memoryGb: 64, diskSizeGb: 200 }
  ];
};
