export async function tryInvoke(fn: () => any) {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
  }
}
