export async function tryCall(fn: () => any) {
  try {
    await fn();
  } catch (e) {
    console.error(e);
  }
}
