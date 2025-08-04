import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { array } from 'prop-types';

export const searchCourse = (query) => {
  query.pageSize = query.limit;

  if(query.run && Array.isArray(query.run)) {
    query.run = query.run.join(',')
  }

  if(query.language && Array.isArray(query.language)) {
    query.language = query.language.join(',')
  }

  if(query.org && Array.isArray(query.org)) {
    query.org = query.org.join(',')
  }

  const baseUrl = 'https://api.hutech-elearning-insights.goamazing.org';
  // var baseUrl = "https://localhost:5001";

  return getHttpClient().post(`${baseUrl}/search`, query);
};

export const getCourseFilters = () => {
  const baseUrl = 'https://api.hutech-elearning-insights.goamazing.org';
  // var baseUrl = "https://localhost:5001";

  return getHttpClient().get(`${baseUrl}/search/filters_v2`);
};

export const getCourseDetail = (courseId, username) => {
  let url = `${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}`;
  if (username) {
    url += `?username=${username}`;
  }
  return getAuthenticatedHttpClient().get(url);
};
