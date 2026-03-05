/** Функция заполняет http.info() необходимыми значениями
 * @example
 * http.describe(TITLES.API,
 *   setTestInfo({
 *    suite: SUITES.API,
 *    subSuite: "user",
 *    tags: [TAGS.api],
 *   }),
 *   */
export const setTestInfo = ({ suite, subSuite, tags }: { suite: string; subSuite?: string; tags?: string[] }) => {
  return {
    annotation: {
      description: suite,
      subSuite,
      suite,
      type: subSuite,
    } as {
      description: string;
      type: string;
      suite?: string;
      subSuite?: string;
    },
    tag: tags,
  };
};
