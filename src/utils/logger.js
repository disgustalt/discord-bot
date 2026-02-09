function log(type, msg) {
  const types = {
    success: { label: 'SUCCESS', clr: '\x1b[32m' },
    info:    { label: 'INFO',    clr: '\x1b[34m' },
    warn:    { label: 'WARN',    clr: '\x1b[33m' },
    error:   { label: 'ERROR',   clr: '\x1b[31m' }
  };

  const r = '\x1b[0m';
  const t = types[type.toLowerCase()];

  if (!t) return;

  console.log(`${t.clr}[${t.label}]${r} ${msg}`);
}

function Init() {
  console.log = (...rawr) => log('info', rawr.join(' ');
  console.warn = (...rawr) => log('warn', rawr.join(' ');
  console.error = (...rawr) => log('error', rawr.join(' ');
  console.success = (...rawr) => log('success', rawr.join(' ');
};

export { Init };
