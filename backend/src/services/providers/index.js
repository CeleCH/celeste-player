import { youtubeMusicProvider } from './youtubeMusicProvider.js';

const providers = {
  youtube: youtubeMusicProvider,
};

const DEFAULT_PROVIDER = 'youtube';

/**
 * Retrieve the requested music provider.
 * @param {string} name - Name of the provider ('youtube')
 */
export const getProvider = (name = DEFAULT_PROVIDER) => {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`El proveedor de música "${name}" no está disponible.`);
  }
  return provider;
};
