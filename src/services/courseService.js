import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const searchCourse = (query) => {
  query.pageSize = query.limit;

  const baseUrl = 'https://api.hutech-elearning-insights.goamazing.org';
  // var baseUrl = "https://localhost:5001";

  return getHttpClient().post(`${baseUrl}/search`, query);
};

export const getCourseFilters = () => {
  const baseUrl = 'https://api.hutech-elearning-insights.goamazing.org';
  // var baseUrl = "https://localhost:5001";

  return getHttpClient().get(`${baseUrl}/search/filters`);
};

export const getCourseDetail = (courseId, username) => {
  let url = `${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}`;
  if (username) {
    url += `?username=${username}`;
  }
  return getAuthenticatedHttpClient().get(url);
};
