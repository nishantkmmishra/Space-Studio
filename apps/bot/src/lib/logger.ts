import chalk from 'chalk';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

const levels = {
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
  SUCCESS: chalk.green,
};

function format(level: LogLevel, message: string, meta?: any) {
  const time = new Date().toISOString();
  const color = levels[level];
  const base = `[${time}] [${color(level)}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
  info: (msg: string, meta?: any) => console.log(format('INFO', msg, meta)),
  warn: (msg: string, meta?: any) => console.warn(format('WARN', msg, meta)),
  error: (msg: string, meta?: any) => console.error(format('ERROR', msg, meta)),
  success: (msg: string, meta?: any) => console.log(format('SUCCESS', msg, meta)),
};
