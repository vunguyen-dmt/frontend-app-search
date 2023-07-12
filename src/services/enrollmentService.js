import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const getCourseEnrollmentInfo = (courseId) => {
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/course/${courseId}`;
  return getAuthenticatedHttpClient().get(url);
};

export const getEnrollmentRole = (courseId) => getAuthenticatedHttpClient().get(`${getConfig().LMS_BASE_URL}/api/enrollment/v1/roles/?course_id=${encodeURIComponent(courseId)}`);

export const enroll = (courseId, mode) => {
  const body = {
    mode,
    course_details: { course_id: courseId },
  };
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().post(url, body);
};

export const getEnrollInfoForAUserInACourse = (courseId, username) => {
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment/${encodeURIComponent(username)},${encodeURIComponent(courseId)}`;
  return getAuthenticatedHttpClient().get(url);
};