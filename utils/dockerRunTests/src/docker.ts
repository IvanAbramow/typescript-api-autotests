import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { log } from '@packages/utils';
import { exec } from 'child_process';
import { execSyncEncoded } from './execSyncEncoded';

type DockerContainerParams = {
  imageId: string | null;
  containerName: string;
};

const execPromise = promisify(exec);

/**
 * Имя контейнера для Playwright
 */
export const PLAYWRIGHT_CONTAINER_NAME: string = 'playwright_test_container';

/**
 * Название Docker-сети для взаимодействия контейнеров
 */
export const DOCKER_NETWORK: string = 'docker_test_network';

const PLAYWRIGHT_IMAGE_TAG: string = 'playwright_tests_web_image';

const packageJsonContent = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));

const { name: projectName, devDependencies } = packageJsonContent;
const playwrightVersion = devDependencies['@playwright/test'];

/**
 * Удаляет Docker-образ по имени
 * @param imageName - Имя образа для удаления
 * @throws {Error} При ошибках выполнения команды docker rmi
 */
const deleteDockerImage = (imageName: string): void => {
  try {
    log.docker(`Delete cached docker image ${imageName}`);
    execSyncEncoded(`docker rmi ${imageName}`, { stdio: 'inherit' });
  } catch (err) {
    log.warning(`Could not delete docker image ${imageName}:`, err);
  }
};

/**
 * Собирает Docker-образ для Playwright
 * @returns {string} ID собранного образа
 */
const buildPlaywrightImage = (): string => {
  deleteDockerImage(PLAYWRIGHT_IMAGE_TAG);

  log.docker(`Building new playwright image ${PLAYWRIGHT_IMAGE_TAG}`);
  execSyncEncoded(
    `docker build \
        --build-arg PW_VERSION=${playwrightVersion} \
        --build-arg PROJECT_NAME=${projectName} \
        --tag ${PLAYWRIGHT_IMAGE_TAG} \
        --file ./Dockerfile-tests .`,
    { stdio: 'inherit' },
  );

  return execSyncEncoded(`docker images --format "{{.ID}}" "${PLAYWRIGHT_IMAGE_TAG}"`);
};

/**
 * Проверяет наличие кэшированного Docker-образа
 * @param imageTag - Тег образа для проверки
 * @returns Promise с ID образа или null, если образ не найден
 * @throws {Error} При ошибках выполнения команды docker inspect
 */
export async function getCachedImageId(imageTag: string): Promise<string | null> {
  try {
    const { stdout } = await execPromise(`docker inspect ${imageTag}`);
    const imageInfo = JSON.parse(stdout);
    const imageId = imageInfo[0]['Id'];

    log.info(`Found cached docker image: ${imageId}`);

    return imageId;
  } catch (error) {
    log.warning(`Error ${error}. No cached docker image ${imageTag}. Building new...`);

    return null;
  }
}

/**
 * Удаляет Docker-контейнер по имени
 * @param containerName - Имя контейнера для удаления
 */
const removeContainer = (containerName: string): void => {
  try {
    const containerId = execSyncEncoded(`docker ps --quiet --filter name=${containerName}`);

    if (containerId) {
      log.docker(`Stopping and removing container ${containerName}`);

      execSyncEncoded(`docker stop ${containerId}`);
      execSyncEncoded(`docker rm ${containerId}`);
    }
  } catch (err) {
    log.warning(`Could not remove container ${containerName}:`, err);
  }
};

/**
 * Удаляет все docker контейнеры
 */
export const removeAllContainers = (): void => {
  removeContainer(PLAYWRIGHT_CONTAINER_NAME);
};

/**
 * Создаёт Docker-сеть, если она не существует
 * @throws {Error} При ошибке создания сети (кроме случая, когда сеть уже существует)
 */
const ensureDockerNetwork = (): void => {
  try {
    log.docker(`Create new docker network: ${DOCKER_NETWORK}`);

    execSyncEncoded(`docker network create ${DOCKER_NETWORK}`);
    log.info('Successfully create docker network');
  } catch (err) {
    if (!(err as Error).message.includes('already exists')) {
      throw err;
    }

    log.warning(`Docker network ${DOCKER_NETWORK} already exists.`);
  }
};

/**
 * Удаляет Docker-сеть, если она существует
 * @throws {Error} При ошибке удаления сети (кроме случая, когда сеть существует)
 */
export const removeDockerNetwork = (): void => {
  try {
    log.docker(`Remove old docker network: ${DOCKER_NETWORK}`);

    execSyncEncoded(`docker network rm ${DOCKER_NETWORK}`);
    log.info('Successfully remove old docker network');
  } catch (err) {
    log.warning('Could not remove network:', err);
  }
};

/**
 * Запускает Docker-контейнер с указанным образом
 * @param params - Параметры запуска контейнера
 * @param params.imageId - ID Docker-образа для запуска
 * @param params.containerName - Имя создаваемого контейнера
 * @throws {Error} При ошибках выполнения команды docker run
 */
export const runPlaywrightDockerContainer = ({ imageId, containerName }: DockerContainerParams): void => {
  const imageIdNormalized = imageId!.replace(/[^a-zA-Z0-9]/g, '');

  log.docker(`Running ${containerName} docker container with ${imageIdNormalized} image id`);
  execSyncEncoded(`docker run --interactive --name=${containerName} --network ${DOCKER_NETWORK} ${imageId}`);
};

/**
 * Запускает контейнеры для тестирования (Playwright)
 * @param useCache - Использовать кэшированный образ
 * @throws {Error} При ошибках сборки образов или запуска контейнеров
 */
export const runContainers = async ({ useCache }: { useCache: boolean }): Promise<void> => {
  try {
    removeAllContainers();

    removeDockerNetwork();
    ensureDockerNetwork();

    const playwrightImageId = useCache ? await getCachedImageId(PLAYWRIGHT_IMAGE_TAG) : buildPlaywrightImage();

    log.info('Running Playwright container...');
    runPlaywrightDockerContainer({
      containerName: PLAYWRIGHT_CONTAINER_NAME,
      imageId: playwrightImageId,
    });

    log.info('Containers are running and connected via network:', DOCKER_NETWORK);
  } catch (e) {
    log.error(e);
  }
};

/**
 * Запускает уже созданный Docker-контейнер
 * @param containerName - Имя запускаемого контейнера
 * @throws {Error} При ошибках выполнения команды docker start
 */
export const startDockerContainer = (containerName: string): void => {
  log.docker(`Starting ${containerName} Docker container`);
  execSyncEncoded(`docker start ${containerName}`);
};

/**
 * Запускает тесты внутри Docker-контейнера
 * @param args - Дополнительные аргументы для команды тестирования (опционально)
 * @throws {Error} При ошибках выполнения команды docker exec
 */
export const runTests = (args = ''): void => {
  log.docker('Run tests');
  execSyncEncoded(
    `docker exec --interactive ${PLAYWRIGHT_CONTAINER_NAME} bash -vc \
      "bun run test --workers=3 --retries=1 ${args} || exit 0"`,
    { stdio: 'inherit' },
  );
};

/**
 * Копирует результаты Allure из Docker-контейнера на хост-систему и удаляет контейнер.
 * @throws {Error} При ошибках выполнения команды docker cp или удаления контейнера
 */
export const copyAllureResultsToRepository = (): void => {
  log.docker('Copying "allure-results" folder to host machine');
  execSyncEncoded(`docker cp ${PLAYWRIGHT_CONTAINER_NAME}:/${projectName}/allure-results ./allure-results`);
};
