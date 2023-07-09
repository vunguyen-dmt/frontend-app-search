import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const searchCourse = (query) => {
  const body = new FormData();
  body.append('search_string', query.query);
  body.append('page_size', query.limit);
  body.append('page_index', query.page - 1);
  return getAuthenticatedHttpClient().post(`${getConfig().LMS_BASE_URL}/search/course_discovery/`, body);
};
