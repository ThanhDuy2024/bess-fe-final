// ===== BESS Mock Data =====

// --- Users ---
export const mockUsers = [
  { id: 1, name: 'John Admin', email: 'admin@bess.com', password: 'admin123', role: 'Admin', status: 'Active', lastLogin: '2026-05-19 14:20', created: '2024-01-01', ip: '192.168.1.10' },
  { id: 2, name: 'Op User', email: 'operator@bess.com', password: 'oper123', role: 'Operator', status: 'Active', lastLogin: '2026-05-19 13:00', created: '2024-01-15', ip: '192.168.1.11' },
  { id: 3, name: 'View User', email: 'viewer@bess.com', password: 'view123', role: 'Viewer', status: 'Active', lastLogin: '2026-05-18 09:00', created: '2024-02-01', ip: '192.168.1.12' },
  { id: 4, name: 'Tech Engineer', email: 'engineer@bess.com', password: 'eng123', role: 'Engineer', status: 'Active', lastLogin: '2026-05-19 10:30', created: '2024-01-20', ip: '192.168.1.13' },
  { id: 5, name: 'Jane Operator', email: 'jane@bess.com', password: 'jane123', role: 'Operator', status: 'Active', lastLogin: '2026-05-19 11:00', created: '2024-03-01', ip: '192.168.1.14' },
  { id: 6, name: 'Bob Viewer', email: 'bob@bess.com', password: 'bob123', role: 'Viewer', status: 'Inactive', lastLogin: '2026-05-10 08:00', created: '2024-04-01', ip: '192.168.1.15' },
  { id: 7, name: 'Alice Eng', email: 'alice@bess.com', password: 'alice123', role: 'Engineer', status: 'Locked', lastLogin: null, created: '2024-05-01', ip: '192.168.1.16' },
  { id: 8, name: 'Charlie Op', email: 'charlie@bess.com', password: 'charlie123', role: 'Operator', status: 'Active', lastLogin: '2026-05-19 12:30', created: '2024-06-01', ip: '192.168.1.17' },
];

// --- System Summary ---
export const mockSystemSummary = {
  systemStatus: 'Online',
  operationMode: 'Auto',
  soc: 85.2,
  soh: 97.8,
  batteryPower: -150,
  availableEnergy: 1.2,
  batteryVoltage: 768,
  batteryCurrent: -195,
  batteryTemperature: 28.5,
  pcsACPower: 148,
  pcsDCPower: 150,
  pcsEfficiency: 98.5,
  pcsTemperature: 42,
  pcsFrequency: 50.01,
  pcsPowerFactor: 0.99,
  pcsACVoltage: 400,
  pcsACCurrent: 214,
  pcsDCVoltage: 768,
  pcsDCCurrent: 195,
  gridPower: 200,
  gridVoltage: 22,
  gridFrequency: 50.01,
  gridStatus: 'Connected',
  pvPower: 35,
  loadPower: 180,
  todayCharge: 850,
  todayDischarge: 720,
  roundTripEfficiency: 94.5,
  activeAlarms: 3,
  remoteControl: true,
  pcsStatus: 'Running',
  bmsStatus: 'Normal',
  batteryStatus: 'Charging',
};

// --- Generate 24h chart data ---
function genHourlyData() {
  const data = [];
  for (let h = 0; h < 24; h++) {
    const hour = `${String(h).padStart(2, '0')}:00`;
    data.push({
      time: hour,
      batteryPower: Math.round((Math.sin(h / 3.8) * 200) + (Math.random() * 30 - 15)),
      gridPower: Math.round(150 + Math.sin(h / 4) * 100 + (Math.random() * 20)),
      pvPower: h >= 6 && h <= 18 ? Math.round(Math.sin((h - 6) / 3.82) * 50) : 0,
      loadPower: Math.round(150 + Math.sin(h / 6) * 50 + (Math.random() * 20)),
      soc: Math.max(20, Math.min(95, Math.round(60 + Math.sin(h / 3.8) * 30))),
      voltage: Math.round(750 + Math.sin(h / 4) * 20),
      current: Math.round(Math.sin(h / 3.8) * 200),
      temperature: Math.round(25 + Math.sin(h / 8) * 8 + Math.random() * 2),
    });
  }
  return data;
}
export const mockHourlyData = genHourlyData();

// --- Battery Containers / Racks / Cells ---
function genCells(rackId, count = 104) {
  const cells = [];
  for (let i = 1; i <= count; i++) {
    const v = +(3.15 + Math.random() * 0.15).toFixed(3);
    const temp = +(25 + Math.random() * 10).toFixed(1);
    let status = 'Normal';
    if (v > 3.28) status = 'High';
    if (v < 3.10) status = 'Low';
    cells.push({ id: `${rackId}-C${String(i).padStart(2, '0')}`, voltage: v, temperature: temp, status });
  }
  return cells;
}

function genRacks(containerId, count = 6) {
  const statuses = ['Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Warning', 'Normal'];
  const racks = [];
  for (let i = 1; i <= count; i++) {
    const id = `${containerId}-R${String(i).padStart(2, '0')}`;
    const soc = +(80 + Math.random() * 10).toFixed(1);
    const soh = +(94 + Math.random() * 5).toFixed(1);
    const voltage = Math.round(380 + Math.random() * 8);
    const current = Math.round(48 + Math.random() * 6);
    const temp = +(26 + Math.random() * 8).toFixed(1);
    const cycles = Math.round(100 + Math.random() * 60);
    const cells = genCells(id);
    const maxCellV = Math.max(...cells.map((c) => c.voltage));
    const minCellV = Math.min(...cells.map((c) => c.voltage));
    const module = [
      "Module 01", 
      "Module 02", 
      "Module 03", 
      "Module 04", 
      "Module 05", 
      "Module 06",
      "Module 07",
      "Module 08"
    ]
    racks.push({
      id,
      status: statuses[i - 1],
      voltage,
      current,
      soc,
      soh,
      temperature: temp,
      cycles,
      cells,
      maxCellV: +maxCellV.toFixed(3),
      minCellV: +minCellV.toFixed(3),
      deltaV: +(maxCellV - minCellV).toFixed(3),
      maxTemp: Math.max(...cells.map((c) => c.temperature)),
      module: module
    });
  }
  return racks;
}

export const mockContainers = [
  { 
    id: 'CTN-01', 
    name: 'Container 1', 
    status: 'Normal', 
    racks: genRacks('CTN-01'), 
    soc: 85.2, 
    soh: 97.8, 
    temperature: 28.5 
  },
]

// --- PCS Fault Codes ---
export const mockPCSFaults = [
  { id: 1, time: '2026-05-19 13:20', code: 'F001', name: 'DC Overvoltage', level: 'Warning', status: 'Active', desc: 'DC bus voltage exceeded 820V' },
  { id: 2, time: '2026-05-18 10:15', code: 'F003', name: 'Overtemperature', level: 'Fault', status: 'Cleared', desc: 'IGBT temperature exceeded 85°C' },
  { id: 3, time: '2026-05-17 08:30', code: 'F005', name: 'Grid Frequency Deviation', level: 'Warning', status: 'Cleared', desc: 'Grid frequency outside 49.5-50.5 Hz' },
  { id: 4, time: '2026-05-16 14:00', code: 'F008', name: 'Communication Lost', level: 'Info', status: 'Cleared', desc: 'Modbus communication timeout' },
  { id: 5, time: '2026-05-15 09:45', code: 'F002', name: 'AC Overcurrent', level: 'Fault', status: 'Cleared', desc: 'AC phase current exceeded 300A' },
];

// --- Alarms ---
const alarmLevels = ['Info', 'Warning', 'Fault', 'Critical'];
const alarmDevices = ['BMS', 'PCS', 'Grid', 'Battery', 'System'];
const alarmMessages = [
  'Overtemperature detected',
  'High voltage warning',
  'Communication lost',
  'SOC below minimum',
  'Grid reconnected',
  'PCS efficiency drop',
  'Cell voltage imbalance',
  'Rack offline',
  'Fan failure',
  'Current sensor fault',
  'Frequency deviation',
  'Power limit reached',
  'Battery over-discharge',
  'Insulation fault',
  'Emergency stop activated',
];
const alarmStatuses = ['Active', 'Acknowledged', 'Cleared'];

export const mockAlarms = Array.from({ length: 55 }, (_, i) => {
  const id = i + 1;
  const d = new Date(2026, 4, 19, 14 - Math.floor(i / 3), 60 - ((i * 7) % 60));
  const level = alarmLevels[i < 3 ? (i === 0 ? 3 : 2) : Math.floor(Math.random() * 4)];
  const status = i < 3 ? 'Active' : alarmStatuses[Math.floor(Math.random() * 3)];
  return {
    id,
    time: d.toISOString().slice(0, 16).replace('T', ' '),
    level,
    device: alarmDevices[i % 5],
    message: alarmMessages[i % alarmMessages.length],
    status,
    operator: status === 'Acknowledged' ? 'Admin' : status === 'Cleared' ? 'Op User' : '-',
    code: `ALM-${String(id).padStart(3, '0')}`,
    description: `Detailed description for alarm ${id}. System detected abnormal condition.`,
    acknowledgedAt: status !== 'Active' ? '2026-05-19 14:15' : null,
    clearedAt: status === 'Cleared' ? '2026-05-19 14:20' : null,
    relatedParams: { voltage: '768V', temperature: '28.5°C', current: '-195A' },
  };
});

function energySeed(dateKey, hour = 0, offset = 0) {
  const base = Number(dateKey.replaceAll("-", "")) + hour * 37 + offset * 101;
  return (Math.sin(base) + 1) / 2;
}

function genHourlyEnergyRow(dateKey, hour) {
  const solarWindow = hour >= 6 && hour <= 18;
  const solarFactor = solarWindow ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;
  const charge = Math.round(4 + solarFactor * 8 + energySeed(dateKey, hour, 1) * 3);
  const discharge = Math.round(3 + (1 - solarFactor * 0.6) * 6 + energySeed(dateKey, hour, 2) * 3);
  const pv = Math.round(solarFactor * 12 + energySeed(dateKey, hour, 3) * 2);
  const gridImport = Math.round(2 + (1 - solarFactor) * 5 + energySeed(dateKey, hour, 4) * 3);
  const gridExport = Math.round(solarFactor * 3 + energySeed(dateKey, hour, 5) * 2);
  const load = Math.round(6 + energySeed(dateKey, hour, 6) * 5 + (hour >= 18 && hour <= 22 ? 3 : 0));
  const efficiency = +(91.5 + energySeed(dateKey, hour, 7) * 4).toFixed(1);

  return {
    date: dateKey,
    time: `${String(hour).padStart(2, "0")}:00`,
    charge,
    discharge,
    pv,
    gridImport,
    gridExport,
    load,
    efficiency,
    cycles: hour === 23 ? +(0.8 + energySeed(dateKey, hour, 8) * 1.7).toFixed(1) : 0,
  };
}

const energyReportDates = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d.toISOString().slice(0, 10);
});

export const mockEnergyReportHourly = energyReportDates.flatMap((dateKey) =>
  Array.from({ length: 24 }, (_, hour) => genHourlyEnergyRow(dateKey, hour)),
);

// --- Energy Report (30 days) ---
export const mockEnergyReport = energyReportDates.map((dateKey) => {
  const rows = mockEnergyReportHourly.filter((item) => item.date === dateKey);
  const total = rows.reduce(
    (acc, row) => ({
      charge: acc.charge + row.charge,
      discharge: acc.discharge + row.discharge,
      pv: acc.pv + row.pv,
      gridImport: acc.gridImport + row.gridImport,
      gridExport: acc.gridExport + row.gridExport,
      load: acc.load + row.load,
      efficiency: acc.efficiency + row.efficiency,
      cycles: acc.cycles + row.cycles,
    }),
    {
      charge: 0,
      discharge: 0,
      pv: 0,
      gridImport: 0,
      gridExport: 0,
      load: 0,
      efficiency: 0,
      cycles: 0,
    },
  );

  return {
    date: dateKey,
    charge: total.charge,
    discharge: total.discharge,
    pv: total.pv,
    gridImport: total.gridImport,
    gridExport: total.gridExport,
    load: total.load,
    efficiency: +(total.efficiency / rows.length).toFixed(1),
    cycles: +total.cycles.toFixed(1),
  };
});

// --- System Settings ---
export const mockSystemSettings = {
  site: {
    site_name: 'BESS Station 01',
    location: 'Ho Chi Minh City',
    capacity: 2000,
    battery_type: 'LFP',
    commissioning_date: '2024-01-15',
    owner: 'Energy Corp',
    operator: 'BESS Operations',
  },
  notification: {
    email_enabled: true,
    email_recipients: 'admin@bess.com, op@bess.com',
    telegram_enabled: true,
    bot_token: '***************************',
    chatId: '-100123456789',
    notify_levels: { critical: true, fault: true, warning: true, info: false },
  },
  realtime: {
    refresh_interval: 5,
    chart_updateInterval: 10,
    data_retention: 30,
    reconnect_Interval: 5,
  },
};
