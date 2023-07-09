import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const getEnrollmentInfo = (courseId) => {
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment/${courseId}`;
  return getAuthenticatedHttpClient().get(url);
};

export const getEnrollmentRole = (courseId) => {
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/roles/?course_id=${encodeURIComponent(courseId)}`;
  return getAuthenticatedHttpClient().get(url);
};

export const enroll = (courseId) => {
  const body = {
    mode: 'audit',
    course_details: { course_id: courseId },
  };
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().post(url, body);
};
