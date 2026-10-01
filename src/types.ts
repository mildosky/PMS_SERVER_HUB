export interface Server {
  id: string;
  name: string;
  url: string;
  property: string;
  environment: 'production' | 'staging' | 'development' | 'training';
  region: string;
  port: string;
  description: string;
  status: 'online' | 'offline' | 'maintenance' | 'unknown';
  lastChecked: string | null;
  addedAt: string;
  tags: string[];
}

export type EnvironmentFilter = 'all' | 'production' | 'staging' | 'development' | 'training';
export type StatusFilter = 'all' | 'online' | 'offline' | 'maintenance' | 'unknown';
