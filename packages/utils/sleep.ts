/**
 * Задержка на указанное количество миллисекунд
 * @param ms - количество миллисекунд для задержки
 * @returns Promise<void>
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
