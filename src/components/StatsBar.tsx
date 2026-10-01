import { Server } from '../types';
import { Monitor, Wifi, WifiOff, Wrench, Globe, HardDrive } from 'lucide-react';

interface StatsBarProps {
  servers: Server[];
}

export function StatsBar({ servers }: StatsBarProps) {
  const online = servers.filter(s => s.status === 'online').length;
  const offline = servers.filter(s => s.status === 'offline').length;
  const maintenance = servers.filter(s => s.status === 'maintenance').length;
  const prodCount = servers.filter(s => s.environment === 'production').length;

  const stats = [
    {
      label: 'Total Servers',
      value: servers.length,
      icon: HardDrive,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Online',
      value: online,
      icon: Wifi,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Offline',
      value: offline,
      icon: WifiOff,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Maintenance',
      value: maintenance,
      icon: Wrench,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Production',
      value: prodCount,
      icon: Monitor,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Regions',
      value: new Set(servers.map(s => s.region)).size,
      icon: Globe,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3"
        >
          <div className={`${stat.bg} p-2 rounded-lg`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
