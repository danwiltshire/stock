export function getConfig(env = process.env) {
  return {
    enableAuth: env.ENABLE_AUTH?.trim().toLowerCase() === "true",
  };
}
