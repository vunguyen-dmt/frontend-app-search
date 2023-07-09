import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const getMFEConfig = () => {
  let url = `${window.location.host}/api/mfe_config/v1?mfe=courses`;
  return getAuthenticatedHttpClient().get(url);
};
