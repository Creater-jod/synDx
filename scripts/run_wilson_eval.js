const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function findPython() {
  const candidates = [
    process.env.PYTHON_PATH,
    'C:\\Users\\NIKIL\\AppData\\Local\\Python\\bin\\python.exe',
    'C:\\Users\\NIKIL\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe',
    'python',
    'python3'
  ].filter(Boolean);

  for (const p of candidates) {
    if (path.isAbsolute(p)) {
      if (fs.existsSync(p)) return p;
    } else {
      return p;
    }
  }
  return 'python';
}

const pythonExe = findPython();
const scriptPath = path.join(__dirname, '..', 'pipeline', 'evaluate_wilson.py');
const args = [scriptPath, ...process.argv.slice(2)];

const proc = spawn(pythonExe, args, { stdio: 'inherit', env: process.env });

proc.on('close', (code) => {
  process.exit(code || 0);
});
