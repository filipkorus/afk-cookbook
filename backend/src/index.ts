import server from './server';
import logger from './utils/logger';
import initDB from './initdb';
import config, {checkConfigFields} from '../config';

Promise.all([
	checkConfigFields(),
	initDB()
])
	.then((resultMessages) => {
		resultMessages.forEach(logger.info);

		server.listen(config.PORT, () => logger.info(`server listening on http://localhost:${config.PORT}`));
	})
	.catch(errorMessage => {
		logger.error(errorMessage);
		process.exit(1);
	});
