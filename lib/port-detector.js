const { execSync } = require('child_process');
const os = require('os');

const platform = os.platform();

const SYSTEM_PIDS = {
  win32: new Set(['0', '4']),
  darwin: new Set(['0', '1']),
  linux: new Set(['0', '1', '2']),
};

const SYSTEM_PROCESS_NAMES = {
  win32: [
    'system', 'svchost.exe', 'services.exe', 'csrss.exe', 'smss.exe',
    'wininit.exe', 'winlogon.exe', 'lsass.exe', 'lsm.exe', 'spoolsv.exe',
    'taskhost.exe', 'taskhostw.exe', 'dwm.exe', 'fontdrvhost.exe',
    'runtimebroker.exe', 'sihost.exe', 'shellinfrahost.exe'
  ],
  darwin: [
    'kernel_task', 'launchd', 'configd', 'user_event_agent', 'coreauthd',
    'securityd', 'distnoted', 'cfprefsd', 'systemstats', 'logd'
  ],
  linux: [
    'systemd', 'init', 'kthreadd', 'rcu_sched', 'migration', 'ksoftirqd',
    'kworker', 'kcompactd', 'khugepaged', 'krxrpc', 'kblockd'
  ],
};

function isSystemProcess(name, pid) {
  if (!name) return true;
  const sysPids = SYSTEM_PIDS[platform] || SYSTEM_PIDS.win32;
  if (sysPids.has(String(pid))) return true;
  
  const lower = name.toLowerCase();
  const sysNames = SYSTEM_PROCESS_NAMES[platform] || SYSTEM_PROCESS_NAMES.win32;
  return sysNames.some(sys => lower.includes(sys.toLowerCase()));
}

function getListeningPorts(localhostOnly = false) {
  try {
    let ports = [];
    if (platform === 'win32') {
      ports = getWindowsPorts();
    } else if (platform === 'darwin') {
      ports = getMacOSPorts();
    } else if (platform === 'linux') {
      ports = getLinuxPorts();
    }
    
    if (localhostOnly) {
      ports = ports.filter(p => p.address === '127.0.0.1' || p.address === '::1');
    }
    
    return ports;
  } catch (e) {
    console.error(`Port detection failed on ${platform}:`, e.message);
    return [];
  }
}

function getWindowsPorts() {
  const output = execSync('netstat -ano | findstr LISTENING', { encoding: 'utf8' });
  const lines = output.trim().split('\n');
  const ports = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      const localAddress = parts[1];
      const pid = parts[4];
      const [host, port] = localAddress.split(':');
      if (!port) continue;

      ports.push({
        address: host,
        port: parseInt(port),
        pid: parseInt(pid),
        protocol: 'TCP',
      });
    }
  }

  return ports;
}

function getMacOSPorts() {
  try {
    const output = execSync('lsof -i -P -n 2>/dev/null | grep LISTEN', { encoding: 'utf8' });
    const lines = output.trim().split('\n').filter(l => l.trim());
    const ports = [];

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;
      
      const processName = parts[0];
      const pid = parseInt(parts[1]);
      const netInfo = parts[8];
      
      const match = netInfo.match(/:(\d+)/);
      if (!match) continue;
      
      const port = parseInt(match[1]);
      const address = netInfo.split(':')[0] || '*';

      ports.push({
        address: address === '*' ? '0.0.0.0' : address,
        port,
        pid,
        protocol: 'TCP',
      });
    }

    return ports;
  } catch (e) {
    return [];
  }
}

function getLinuxPorts() {
  try {
    let output;
    try {
      output = execSync('ss -tlnp 2>/dev/null', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1);
      return parseLinuxSSOutput(lines);
    } catch (e) {
      output = execSync('netstat -tlnp 2>/dev/null', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(2);
      return parseLinuxNetstatOutput(lines);
    }
  } catch (e) {
    return [];
  }
}

function parseLinuxSSOutput(lines) {
  const ports = [];
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) continue;
    
    const localAddress = parts[4];
    const processInfo = parts[5] || '';
    
    const [host, port] = localAddress.split(':');
    if (!port) continue;
    
    const pidMatch = processInfo.match(/pid=(\d+)/);
    const pid = pidMatch ? parseInt(pidMatch[1]) : 0;
    
    ports.push({
      address: host === '*' ? '0.0.0.0' : host,
      port: parseInt(port),
      pid,
      protocol: 'TCP',
    });
  }
  
  return ports;
}

function parseLinuxNetstatOutput(lines) {
  const ports = [];
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 7) continue;
    
    const localAddress = parts[3];
    const pidAndName = parts[6];
    
    const [host, port] = localAddress.split(':');
    if (!port) continue;
    
    const pid = pidAndName.includes('/') ? parseInt(pidAndName.split('/')[0]) : 0;
    
    ports.push({
      address: host === '*' ? '0.0.0.0' : host,
      port: parseInt(port),
      pid,
      protocol: 'TCP',
    });
  }
  
  return ports;
}

const processCache = new Map();
const CACHE_TTL = 5000;

function getProcessName(pid) {
  const cached = processCache.get(pid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    if (platform === 'win32') {
      const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' });
      const parts = output.trim().split(',');
      if (parts.length >= 1) {
        const name = parts[0].replace(/"/g, '');
        const data = { name, isSystem: isSystemProcess(name, pid) };
        processCache.set(pid, { data, timestamp: Date.now() });
        return data;
      }
    } else if (platform === 'darwin' || platform === 'linux') {
      const output = execSync(`ps -p ${pid} -o comm= 2>/dev/null`, { encoding: 'utf8' });
      const name = output.trim() || 'Unknown';
      const data = { name, isSystem: isSystemProcess(name, pid) };
      processCache.set(pid, { data, timestamp: Date.now() });
      return data;
    }
  } catch (e) {}
  
  const data = { name: 'Unknown', isSystem: true };
  processCache.set(pid, { data, timestamp: Date.now() });
  return data;
}

function clearProcessCache() {
  processCache.clear();
}

function killProcess(pid) {
  try {
    if (platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
    } else {
      execSync(`kill -9 ${pid}`, { encoding: 'utf8' });
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = {
  getListeningPorts,
  getProcessName,
  killProcess,
  isSystemProcess,
  platform,
  clearProcessCache,
};

if (require.main === module) {
  const ports = getListeningPorts(false);
  console.log(`Found ${ports.length} ports:`);
  ports.forEach(p => console.log(`  ${p.port} - PID ${p.pid} - ${p.address}`));
}
