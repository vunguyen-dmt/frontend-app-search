import React from 'react';
import './courseAbout.scss';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import {
  Hyperlink, Icon, Button, Spinner,
} from '@edx/paragon';
import {
  ArrowBackIos, Event, InfoOutline, Person, ArrowForward, PlayCircle,
} from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getCourseDetail } from '../../services/courseService';
import {
  getCourseEnrollmentInfo, getEnrollmentRole, enroll, getEnrollInfoForAUserInACourse,
} from '../../services/enrollmentService';
import messages from '../../messages/messages';
import hutechLogo from '../../assets/images/hutech-logo.png';
import { getCookie } from '../../data/util';
import defaultCourseImage from '../../assets/images/default-course-image.jpg';

const CourseAbout = ({ intl }) => {
  const [courseHiddenInfo, setCourseHiddenInfo] = React.useState({});
  const [showVideo, setShowVideo] = React.useState(false);
  const [courseDetailResponse, setCourseDetailResponse] = React.useState(null);
  const [courseEnrollmentInfo, setCourseEnrollmentInfo] = React.useState(null);
  const [enrollErrorMsg, setEnrollErrorMsg] = React.useState('');
  const [canEnrollRegardless, setCanEnrollRegardless] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);
  const [courseImageUrl, setCourseImageUrl] = React.useState('');
  const [isEnrolled, setIsEnrolled] = React.useState(0); // 0 getting data, 1 enrolled, -1 unenrolled.
  const params = useParams();
  const user = getAuthenticatedUser();

  const languageCode = () => getCookie(getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME) || 'en';
  const toLocalDate = (d) => {
    if (!d) {
      return '';
    }
    const item = new Date(d);
    return item.toLocaleDateString(languageCode());
  };

  const extractCourseRun = () => {
    try {
      return params.id.split('+')[2];
    } catch {}
    return '';
  };

  const getHiddenInfo = (html) => {
    try {
      const el = document.createElement('html');
      el.innerHTML = html;
      const blocks = el.getElementsByClassName('course-about-hidden-info');
      if (blocks && blocks.length > 0) {
        const json = JSON.parse(blocks[0].innerHTML);
        setCourseHiddenInfo(json);
        return;
      }
    } catch (error) {}
    setCourseHiddenInfo({});
  };

  React.useEffect(() => {
    const courseId = params.id;
    getCourseDetail(courseId, user?.username).then(response => {
      if (response && response.name && response.name.startsWith('[OC] ')) {
        response.name = response.name.replace('[OC] ', '');
      }
      setCourseDetailResponse(response);
      setCourseImageUrl(response.data.media.image.small);
      document.title = `${response.data.name} | ${intl.formatMessage(messages.pageTitle)} | ${getConfig().SITE_NAME}`;
      getHiddenInfo(response.data.overview);
    }).catch(error => {
      setNotFound(true);
    });

    getCourseEnrollmentInfo(params.id).then(response => {
      setCourseEnrollmentInfo(response.data);
    }).catch(error => {
    });

    if (user) {
      getEnrollInfoForAUserInACourse(params.id, user.username).then(response => {
        if (response.data && response.data.is_active) {
          setIsEnrolled(1);
        } else {
          setIsEnrolled(-1);
        }
      }).catch(error => {
        setIsEnrolled(-1);
      });
    } else {
      setIsEnrolled(-1);
    }

    getEnrollmentRole(params.id).then(response => {
      if (response && response.data && ((response.data.roles.length === 1 && (response.data.roles[0].role === 'staff' || response.data.roles[0].role === 'admin' || response.data.roles[0].role === 'instructor')) || response.data.is_staff === true)) {
        setCanEnrollRegardless(true);
      }
    }).catch(error => {

    });
  }, [params.id]);

  const imageErrorHandle = () => {
    setCourseImageUrl(defaultCourseImage);
  };

  const viewCourseClickedHandle = () => {
    window.location.href = `${getConfig().LEARNING_BASE_URL}/course/${params.id}/home`;
  };

  const viewCourseInStudioClickedHandle = () => {
    window.location.href = `${getConfig().STUDIO_BASE_URL}/settings/details/${params.id}`;
  };

  const enrollButtonClickedHandle = () => {
    if (!user) {
      window.location.href = getConfig().LOGIN_URL;
    } else {
      enroll(params.id, courseEnrollmentInfo.course_modes[0].slug).then(response => {
        viewCourseClickedHandle();
      }).catch(error => {
        let msg = 'Something went wrong. Please try again later!';
        try {
          const responseErrorMsg = JSON.parse(error.customAttributes.httpErrorResponseData).message;
          if (responseErrorMsg) {
            msg = responseErrorMsg;
          }
        } catch {}
        setEnrollErrorMsg(msg);
      });
    }
  };

  const backToCoursesHandle = () => getConfig().PUBLIC_PATH;

  return (
    <div>
      {
        !courseDetailResponse && !notFound && <div className="text-center mt-3"><Spinner animation="border" className="mie-3" screenReaderText="loading" /></div>
      }
      { courseDetailResponse
        && (
        <div className="about-page-wrapper">
          <div className="head-area-wrapper">
            <div className="container container-mw-lg">
              <div className="page-nav">
                <Hyperlink destination={backToCoursesHandle()} className="mr-1">
                  <Icon
                    size="xs"
                    src={ArrowBackIos}
                    className="fa fa-book"
                  /><span className="nav-text">{intl.formatMessage(messages.Courses)}</span>
                </Hyperlink>
              </div>
              <div>
                <img alt="org logo" className="org-logo" src={hutechLogo} />
              </div>
            </div>
            <div className="head-area container container-mw-lg">
              <div>

                <div><div className="course-name">{courseDetailResponse.data.name}</div></div>
                <div className="short-description">{courseDetailResponse.data.short_description}</div>
                <div className="enroll-btn-wrapper">
                  {isEnrolled === 1 && <Button onClick={viewCourseClickedHandle} variant="danger" className="text-nowrap">{intl.formatMessage(messages['View course'])}</Button>}
                  {isEnrolled === -1 && courseEnrollmentInfo != null && (!courseDetailResponse.data.invitation_only || canEnrollRegardless) && <Button variant="danger" className="text-nowrap" onClick={enrollButtonClickedHandle}>{intl.formatMessage(messages['Enroll now'])}</Button>}
                  {isEnrolled === -1 && courseDetailResponse.data.invitation_only && !canEnrollRegardless && <Button disabled variant="danger">{intl.formatMessage(messages['Enrollment in this course is by invitation only'])}</Button>}
                </div>
                {
                  enrollErrorMsg && enrollErrorMsg.length > 0 && <div className="alert alert-danger" role="alert">{enrollErrorMsg}</div>
                }
              </div>
              <div className="media">
                {
                  !showVideo
                  && (
                    <div className="media-image-video">
                      {courseHiddenInfo && courseHiddenInfo.video && <Button className="play-video" onClick={() => (setShowVideo(true))} iconBefore={PlayCircle} variant="inverse-primary">{intl.formatMessage(messages.playVideo)}</Button>}
                      <img className="course-image" alt="banner" src={courseImageUrl} onError={imageErrorHandle} />
                    </div>
                  )
                }
                {
                  showVideo && courseHiddenInfo.video && !courseHiddenInfo.video.startsWith('https://www.youtube.com')
                  && (
                  <video controls autoPlay>
                    <source src={courseHiddenInfo.video} type={courseHiddenInfo.videoType ? courseHiddenInfo.videoType : 'video/mp4'} />
                  </video>
                  )
                }
                {
                  showVideo && courseHiddenInfo.video && courseHiddenInfo.video.startsWith('https://www.youtube.com')
                  && <iframe height="300" src={courseHiddenInfo.video} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                }
              </div>
            </div>
          </div>
          <div className="info-area-wrapper">
            <div className="skew-1 skew" />
            <div className="skew-2 skew" />
            <div className="info-area container container-mw-lg">
              <div>
                <div><Icon src={InfoOutline} className="fa fa-book" /></div>
                <div>
                  <div className="fw-600">{intl.formatMessage(messages['Course number'])}: {courseDetailResponse.data.number}</div>
                  <div className="s-text">{intl.formatMessage(messages.courseRun)}: {extractCourseRun()}</div>
                </div>
              </div>
              <div>
                <div><Icon src={Event} className="fa fa-book" /></div>
                <div>
                  <div className="fw-600">{intl.formatMessage(messages.Start)}: {toLocalDate(courseDetailResponse.data.start)}</div>
                  <div className="s-text">{intl.formatMessage(messages.Enroll)}: {toLocalDate(courseDetailResponse.data.enrollment_start)}</div>
                </div>
              </div>
              <div>
                <div><Icon src={Person} className="fa fa-book" /></div>
                <div>
                  <div className="fw-600">{courseDetailResponse.data.pacing === 'instructor' ? intl.formatMessage(messages['Instructor-Paced']) : intl.formatMessage(messages['Self-Paced'])}</div>
                  <div className="s-text">{courseDetailResponse.data.pacing === 'instructor' ? intl.formatMessage(messages.progressAtInstructorPace) : intl.formatMessage(messages.progressAtYourOwnPace)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="body-area-wrapper">
            <div className="body-area container container-mw-lg">
              {
                canEnrollRegardless
                && (
                <div className="view-course-in">
                  <Button onClick={viewCourseClickedHandle} variant="outline-primary" iconAfter={ArrowForward}>{intl.formatMessage(messages.viewInLMS)}</Button>
                  <Button onClick={viewCourseInStudioClickedHandle} variant="outline-danger" iconAfter={ArrowForward}>{intl.formatMessage(messages.viewInStudio)}</Button>
                </div>
                )
              }

              <div className="about-content" dangerouslySetInnerHTML={{ __html: courseDetailResponse.data.overview }} />
            </div>
          </div>
        </div>
        )}
      {
            notFound && (
            <div className="text-center my-6">
              <div>{intl.formatMessage(messages['The page you\'re looking for is unavailable or there\'s an error in the URL. Please check the URL and try again'])}</div>
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
