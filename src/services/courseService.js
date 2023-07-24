import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

// export const searchCourse = (query) => {
//   const body = new FormData();
//   body.append('search_string', query.query);
//   body.append('page_size', query.limit);
//   body.append('page_index', query.page - 1);
//   if (query.org) {
//     body.append('org', query.org);
//   }
//   if (query.language) {
//     body.append('language', query.language);
//   }
//   return getAuthenticatedHttpClient().post(`${getConfig().LMS_BASE_URL}/search/course_discovery/`, body);
// };

export const searchCourse = (query) => {
  const body = {
    query: query.query,
    page: query.page,
    pageSize: query.limit,
    org: query.org,
    language: query.language
  };

  var baseUrl = "https://insights.lms.hutech.edu.vn";
  // var baseUrl = "https://localhost:5001";

  return getHttpClient().post(`${baseUrl}/search`, body);
};

export const getCourseFilters = () => {
  var baseUrl = "https://insights.lms.hutech.edu.vn";
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
