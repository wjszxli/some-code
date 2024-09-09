// 模拟异步请求
export const mockSuccessRequest = (value: string, delay = 100) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(value), delay));

export const mockFailRequest = (error: string, delay = 100) =>
  new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error(error)), delay)
  );
