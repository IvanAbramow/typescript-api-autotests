import { log } from '@packages/utils';
import { clearAllureArtifacts, generateAndOpenAllureReport } from './src/allure';
import {
  copyAllureResultsToRepository,
  PLAYWRIGHT_CONTAINER_NAME,
  removeAllContainers,
  removeDockerNetwork,
  runContainers,
  runTests,
  startDockerContainer,
} from './src/docker';
import { getTestParamsAndAllureChoices } from './src/readline';

const start = async () => {
  try {
    await clearAllureArtifacts();

    const { testPath, shouldOpenAllure, useCache } = await getTestParamsAndAllureChoices();

    log.info('Starting pipeline for run tests...');
    await runContainers({ useCache });

    startDockerContainer(PLAYWRIGHT_CONTAINER_NAME);

    runTests(testPath);

    copyAllureResultsToRepository();
    await generateAndOpenAllureReport(shouldOpenAllure);
  } catch (e) {
    log.error(e);
    process.exit(1);
  } finally {
    removeAllContainers();

    removeDockerNetwork();

    log.info('Pipeline completed successfully!');
  }
};

start()
  .catch((error) => {
    log.error('Unhandled error in http pipeline:', error);
  })
  .finally(() => {
    process.exit();
  });
