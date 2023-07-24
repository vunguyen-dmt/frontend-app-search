import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  SearchField, Collapsible, Menu, MenuItem, Form,
  Button, Breadcrumb, Icon, Hyperlink, Pagination, Card, Badge, ModalPopup, useToggle,
} from '@edx/paragon';
import { Home } from '@edx/paragon/icons';
import * as qs from 'qs';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { searchCourse, getCourseFilters } from '../../services/courseService';
import './search.scss';
import messages from '../../messages/messages';
import { updateQueryStringParameter } from '../../data/util';
import FilterArea from '../../components/FilterArea/FilterArea';
import hutechLogo from '../../assets/images/hutech-logo.png';
import defaultCourseImage from '../../assets/images/default-course-image.jpg';

const Search = ({ intl }) => {
  document.title = `${intl.formatMessage(messages.pageTitle)} | ${getConfig().SITE_NAME}`;

  const parsePage = () => {
    const page = Number(qs.parse(window.location.search, { ignoreQueryPrefix: true }).page);
    return isInt(page) ? Number(page) : 1;
  };

  const parseQuery = () => {
    const { q } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    return q || '';
  };

  const [searchQuery, setSearchQuery] = React.useState(parseQuery());
  const [dropdownResponse, setDropdownResponse] = React.useState(null);
  const [searchResponse, setSearchResponse] = React.useState(null);
  const [numberOfPage, setNumberOfPage] = React.useState(1);
  const [courseFilters, setCourseFilters] = React.useState({});

  const numberOfItemPerPage = 24;
  const setSearchBoxAutoCompleteOff = React.useRef(false);

  let searchDropdownTimerId;

  const isInt = (value) => !Number.isNaN(value)
           && parseInt(Number(value)) == value
           && !Number.isNaN(parseInt(value));

  const history = useHistory();

  const [query, setQuery] = React.useState({
    page: parsePage(),
    limit: numberOfItemPerPage,
    query: parseQuery(),
  });

  React.useEffect(() => {
    getCourseFilters().then(response => {
      setCourseFilters(response.data.results);
    });
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      clearTimeout(searchDropdownTimerId);
    });
    searchCourse(query).then(response => {
      setSearchResponse(response);
      setNumberOfPage(Math.ceil(response.data.total / numberOfItemPerPage));
    });
  }, [query, history]);

  React.useEffect(() => {
    if (!setSearchBoxAutoCompleteOff.current) {
      document.querySelector('.search-area input[role="searchbox"]')?.setAttribute('autoComplete', 'off');
      setSearchBoxAutoCompleteOff.current = true;
    }
    const delay = 500;
    clearTimeout(searchDropdownTimerId);
    if (searchQuery) {
      searchDropdownTimerId = setTimeout(() => {
        searchCourse({
          page: 1,
          limit: 5,
          query: searchQuery,
        }).then(response => {
          setDropdownResponse(response);
        });
      }, delay);
    }
    return () => {
      clearTimeout(searchDropdownTimerId);
    };
  }, [searchQuery]);

  window.onpopstate = () => {
    setQuery({
      page: parsePage(),
      limit: numberOfItemPerPage,
      query: parseQuery(),
    });
  };

  const pagingClickedHandle = (page) => {
    history.push(updateQueryStringParameter(`/${window.location.search}`, 'page', page));
    setQuery({ ...query, page });
  };

  const searchBoxOnChangeHandle = async (value) => {
    if (searchQuery !== value) {
      setSearchQuery(value);
    }
  };

  const searchSubmittedHandle = () => {
    clearTimeout(searchDropdownTimerId);
    setDropdownResponse(null);
    setQuery({ ...query, page: 1, query: searchQuery });
    history.push(updateQueryStringParameter(updateQueryStringParameter(`/${window.location.search}`, 'page', 1), 'q', searchQuery));
  };

  const searchClearHandle = () => {
    clearTimeout(searchDropdownTimerId);
    setDropdownResponse(null);
    setQuery({ ...query, page: 1, query: '' });
    history.push(updateQueryStringParameter(updateQueryStringParameter(`/${window.location.search}`, 'page', 1), 'q', ''));
  };

  const goToHomeHandle = () => getConfig().LMS_BASE_URL;

  const courseAboutPageUrl = (courseId) => `${getConfig().PUBLIC_PATH}${courseId}`;

  const goToCourseAboutPage = (courseId) => {
    window.location.href = courseAboutPageUrl(courseId);
  };

  const backToCoursesHandle = () => {
    window.location.href = getConfig().PUBLIC_PATH;
  };

  const handleFilterItemChange = (value) => {
    const newData = { ...query };
    newData.language = value.language;
    newData.org = value.org;
    setQuery(newData);
    history.push(updateQueryStringParameter(updateQueryStringParameter(`/${window.location.search}`, 'language', newData.language), 'org', newData.org));
  };

  return (
    <div className="search-page-wrapper">
      <div className="search-bg">
        <div className="search-area container container-mw-lg">
          <div className="title">{intl.formatMessage(messages['Search our catalog'])}</div>
          <SearchField
            submitButtonLocation="external"
            buttonText={intl.formatMessage(messages.Search)}
            placeholder={intl.formatMessage(messages['What are you looking for?'])}
            value={searchQuery}
            onSubmit={searchSubmittedHandle}
            onChange={searchBoxOnChangeHandle}
            onClear={searchClearHandle}
          />
          {
            dropdownResponse && dropdownResponse.data.results.length > 0
            && (
            <div className="search-dropdown shadow-lg">
              <ul>
                {
                dropdownResponse.data.results.map((item) => (
                  <li key={item.id}><a onClick={() => goToCourseAboutPage(item.id)}>{item.display_name} <Badge variant="light">{item.display_number_with_default}</Badge></a></li>
                ))
              }
                {dropdownResponse.data.total > 5 && <li className="view-all-search-result"><a onClick={searchSubmittedHandle}>{intl.formatMessage(messages['View all results'])}</a></li>}
              </ul>
            </div>
            )
          }
        </div>
      </div>
      {
        searchResponse && <FilterArea data={courseFilters} onChange={handleFilterItemChange} />
      }
      <div className="search-result-wrapper">
        <div className="search-result container container-mw-lg">
          <div className="page-nav d-flex">
            <Hyperlink destination={goToHomeHandle()} className="mr-1">
              <Icon
                src={Home}
                className="fa fa-book"
              />
            </Hyperlink>
            <Breadcrumb
              ariaLabel="Breadcrumb basic"
              links={[
                { label: intl.formatMessage(messages.Home), href: getConfig().LMS_BASE_URL },
              ]}
              activeLabel={intl.formatMessage(messages.Search)}
            />
          </div>
          <div>
            <div>
              <div className="title">{intl.formatMessage(messages.Courses)}</div>
              {searchResponse?.data.results.length > 0 && (searchQuery || query.language || query.org) && <p className="small">{searchResponse?.data.total} {intl.formatMessage(messages['results on'])} {process.env.SITE_NAME}.</p>}
              <div className="card-list d-flex">
                {
                    searchResponse?.data.results.map((item) => (
                      <Card
                        key={item.id}
                        as={Hyperlink}
                        destination={courseAboutPageUrl(item.id)}
                        isClickable
                      >
                        <Card.ImageCap
                          src={`${getConfig().LMS_BASE_URL}${item.course_image_url}`}
                          fallbackSrc={defaultCourseImage}
                          logoSrc={hutechLogo}
                          srcAlt="course image"
                        />
                        <div className="org-and-number">
                          <div>
                            <Badge variant="light">{intl.formatMessage(messages.Course)}</Badge>
                          </div>
                          <div>{item.display_org_with_default}</div>
                          <div>{item.display_number_with_default}</div>
                        </div>
                        <Card.Header
                          title={item.display_name}
                        />
                        <Card.Section>
                          <div className="space" />
                        </Card.Section>
                        <Card.Footer>
                          <div className="s-text mt-1">{intl.formatMessage(messages.Start)}: {item.start ? new Date(item.start).toLocaleDateString() : ''}</div>
                        </Card.Footer>
                      </Card>
                    ))
                }
              </div>
              {
                  searchResponse && searchResponse.data.results.length === 0 && (
                  <div className="text-center">
                    <p>{intl.formatMessage(messages['No courses were found to match your search query'])}.</p>
                    <div>
                      <Button size="sm" onClick={backToCoursesHandle} variant="link" size="inline">{intl.formatMessage(messages['Back to search'])}</Button>
                    </div>
                  </div>
                  )
              }
            </div>
            {
              numberOfPage > 1
              && (
              <div className="search-paging">
                <Pagination
                  variant="secondary"
                  paginationLabel="pagination navigation"
                  pageCount={numberOfPage}
                  currentPage={query.page}
                  size="small"
                  onPageSelect={pagingClickedHandle}
                />
              </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

Search.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
