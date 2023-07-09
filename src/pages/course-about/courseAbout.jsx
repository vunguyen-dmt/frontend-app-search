import React from 'react';
import './courseAbout.scss';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import {
  Hyperlink, Icon, Button,
} from '@edx/paragon';
import {
  ArrowBackIos, Event, InfoOutline, Person,
} from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getCourseDetail } from '../../services/courseService';
import { getEnrollmentInfo, getEnrollmentRole, enroll } from '../../services/enrollmentService';
import messages from '../../messages/messages';

const CourseAbout = ({ intl }) => {
  const [courseDetailResponse, setCourseDetailResponse] = React.useState(null);
  const [canEnrollRegardless, setCanEnrollRegardless] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);
  const [courseImageUrl, setCourseImageUrl] = React.useState('');
  const [isEnrolled, setIsEnrolled] = React.useState(0); // 0 getting data, 1 enrolled, -1 unenrolled.
  const defaultImageUrl = 'https://dmt-statics.s3.ap-southeast-1.amazonaws.com/open-edx/images/HUTECH/default-course-image.png';
  const params = useParams();
  const user = getAuthenticatedUser();

  React.useEffect(() => {
    const courseId = params.id;
    getCourseDetail(courseId, user?.username).then(response => {
      setCourseDetailResponse(response);
      setCourseImageUrl(response.data.media.image.small);
      document.title = `${response.data.name} | ${process.env.SITE_NAME}`;
    //   if (window.innerWidth <= 600) {
    //     setCourseImageUrl(response.data.media.image.small);
    //   } else {
    //     setCourseImageUrl(response.data.media.image.large);
    //   }
    }).catch(error => {
      setNotFound(true);
    });

    getEnrollmentInfo(params.id).then(response => {
      if (response.data) {
        setIsEnrolled(1);
      } else {
        setIsEnrolled(-1);
      }
    }).catch(error => {
      setIsEnrolled(-1);
    });

    getEnrollmentRole(params.id).then(response => {
      if (response && response.data && ((response.data.roles.length === 1 && (response.data.roles[0].role === 'staff' || response.data.roles[0].role === 'admin' || response.data.roles[0].role === 'instructor')) || response.data.is_staff === true)) {
        setCanEnrollRegardless(true);
      }
    });
  }, [params.id]);

  const imageErrorHandle = () => {
    setCourseImageUrl(defaultImageUrl);
  };

  const enrollButtonClickedHandle = () => {
    if (!user) {
      window.location.href = '/authn/login';
    } else {
      enroll(params.id).then(response => {
      }).catch(error => {
        console.log(error);
      });
    }
  };

  return (
    <div>
      { courseDetailResponse
        && (
        <div>
          <div className="head-area-wrapper">
            <div className="head-area container">
              <div>
                <div className="page-nav">
                  <Hyperlink destination="/courses" className="mr-1">
                    <Icon
                      size="xs"
                      src={ArrowBackIos}
                      className="fa fa-book"
                    /><span className="nav-text">{intl.formatMessage(messages.Courses)}</span>
                  </Hyperlink>
                </div>
                <div><div className="course-name">{courseDetailResponse.data.name}</div></div>
                <div className="short-description">{courseDetailResponse.data.short_description}</div>
                <div className="enroll-btn-wrapper">
                  {isEnrolled === 1 && <a href="/learning/course/course-v1:MIS+COS116+2021_T2B/home"><Button variant="danger" className="text-nowrap">{intl.formatMessage(messages['View course'])}</Button></a>}
                  {isEnrolled === -1 && (!courseDetailResponse.data.invitation_only || canEnrollRegardless) && <Button variant="danger" className="text-nowrap" onClick={enrollButtonClickedHandle}>{intl.formatMessage(messages['Enroll now'])}</Button>}
                  {isEnrolled === -1 && courseDetailResponse.data.invitation_only && !canEnrollRegardless && <Button disabled variant="danger">{intl.formatMessage(messages['Enrollment in this course is by invitation only'])}</Button>}
                </div>
              </div>
              <div className="media">
                <img className="course-image" alt="banner" src={courseImageUrl} onError={imageErrorHandle} />
              </div>
            </div>
          </div>
          <div className="info-area-wrapper">
            <div className="info-area container">
              <div>
                <div><Icon src={InfoOutline} className="fa fa-book" /></div>
                <div>{intl.formatMessage(messages['Course number'])}: {courseDetailResponse.data.number}</div>
              </div>
              <div>
                <div><Icon src={Event} className="fa fa-book" /></div>
                <div>{intl.formatMessage(messages.Start)}: {courseDetailResponse.data.start_display ? courseDetailResponse.data.start_display : new Date(courseDetailResponse.data.start).toLocaleDateString()}</div>
              </div>
              <div>
                <div><Icon src={Person} className="fa fa-book" /></div>
                <div>{courseDetailResponse.data.pacing === 'instructor' ? intl.formatMessage(messages['Instructor-Paced']) : intl.formatMessage(messages['Self-Paced'])}</div>
              </div>
            </div>
          </div>
          <div className="body-area-wrapper">
            <div className="body-area container">
              <div dangerouslySetInnerHTML={{ __html: courseDetailResponse.data.overview }} />
            </div>
          </div>
        </div>
        )}
      {
            notFound && (
            <div className="text-center my-6">
              <div>{intl.formatMessage(messages['The page you\'re looking for is unavailable or there\'s an error in the URL. Please check the URL and try again'])}.</div>
            </div>
            )
        }
    </div>
  );
};

CourseAbout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseAbout);
