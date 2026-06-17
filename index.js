const { launchBot } = require('./src/bot');

launchBot().catch((error) => {
  console.error('Ошибка запуска бота:', error);
  process.exit(1);
});
