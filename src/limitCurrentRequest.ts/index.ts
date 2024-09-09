export function limitCurrentRequest<T>(
  requestList: (() => Promise<T>)[] = [],
  limitRequest: number = 3
) {
  return new Promise((resolve, reject) => {
    const results: (T | Error)[] = [];
    let maxRequestCount = 0;
    let currentIndex = 0;

    if (limitRequest <= 0 || requestList.length === 0) {
      resolve(results);
      return;
    }

    const runNext = async () => {
      if (currentIndex >= requestList.length && maxRequestCount === 0) {
        resolve(results);
        return;
      }

      while (
        maxRequestCount < limitRequest &&
        currentIndex < requestList.length
      ) {
        const requestIndex = currentIndex++;
        maxRequestCount++;
        try {
          const result = await requestList[requestIndex]();
          results[requestIndex] = result;
        } catch (error) {
          results[requestIndex] =
            error instanceof Error ? error : new Error(String(error));
        } finally {
          maxRequestCount--;
          runNext();
        }
      }
    };
    runNext();
  });
}
