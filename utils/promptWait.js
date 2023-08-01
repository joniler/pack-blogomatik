export const promptWait = (func, ms) => {
  return new Promise(resolve => setTimeout(() => {
    func();
    resolve();
  }, ms));
}