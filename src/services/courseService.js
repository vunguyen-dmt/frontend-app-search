import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const searchCourse = (query) => {
  query.pageSize = query.limit;

  if(query.run && Array.isArray(query.run)) {
    /* the reason for this is because the univerisity used various forms of RUN,
    in the view we grouped it to a form like HK1-2022-2023, but in the params we have to use
    all possible forms.
    */
    let genRuns = [];
    query.run.forEach((i) => {
      const split = i.split('-');
      if (split.length === 3 && split[0].startsWith('HK')) {
        genRuns = genRuns.concat([
          `${split[0]}-${split[1]}-${split[2]}`,
          `${split[0]}A-${split[1]}-${split[2]}`,
          `${split[0]}B-${split[1]}-${split[2]}`,

          `${split[1]}-${split[2]}-${split[0]}`,
          `${split[1]}-${split[2]}-${split[0]}A`,
          `${split[1]}-${split[2]}-${split[0]}B`,

          `${split[0]}_${split[1]}_${split[2]}`,
          `${split[0]}A_${split[1]}_${split[2]}`,
          `${split[0]}B_${split[1]}_${split[2]}`,

          `${split[1]}_${split[2]}_${split[0]}`,
          `${split[1]}_${split[2]}_${split[0]}A`,
          `${split[1]}_${split[2]}_${split[0]}B`
        ]);
      }
    })
    query.run = genRuns.join(',')
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
