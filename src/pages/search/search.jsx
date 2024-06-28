import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchField,
  Button, Breadcrumb, Icon, Hyperlink, Pagination, Card, Badge,
} from '@openedx/paragon';
import { Home } from '@openedx/paragon/icons';
import * as qs from 'qs';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { searchCourse, getCourseFilters } from '../../services/courseService';
import './search.scss';
import messages from '../../messages/messages';
import { updateQueryStringParameter } from '../../data/util';
import FilterArea from '../../components/FilterArea/FilterArea';
import hutechLogo from '../../assets/images/hutech-logo.png';
import defaultCourseImage from '../../assets/images/default-course-image.jpg';

const Search = () => {
  const { formatMessage } = useIntl();
  document.title = `${formatMessage(messages.pageTitle)} | ${getConfig().SITE_NAME}`;

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

  // const history = useHistory();
  const navigate  = useNavigate();

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      clearTimeout(searchDropdownTimerId);
    });
    searchCourse(query).then(response => {
      if (response && response.results) {
        response.results.forEach(i => {
          if (i.display_name && i.display_name.startsWith('[OC] ')) {
            i.display_name = i.display_name.replace('[OC] ', '');
          }
        });
      }
      setSearchResponse(response);
      setNumberOfPage(Math.ceil(response.data.total / numberOfItemPerPage));
    });
  }, [query, navigate]);

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
    navigate(updateQueryStringParameter(`/${window.location.search}`, 'page', page));
    // history.push(updateQueryStringParameter(`/${window.location.search}`, 'page', page));
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
    let path = updateQueryStringParameter(`/${window.location.search}`, 'page', 1);
    path = updateQueryStringParameter(path, 'q', searchQuery);
    navigate(path);
    // history.push(path);
  };

  const searchClearHandle = () => {
    clearTimeout(searchDropdownTimerId);
    setDropdownResponse(null);
    setQuery({ ...query, page: 1, query: '' });
    navigate(updateQueryStringParameter(updateQueryStringParameter(`/${window.location.search}`, 'page', 1), 'q', ''));
    // history.push(updateQueryStringParameter(updateQueryStringParameter(`/${window.location.search}`, 'page', 1), 'q', ''));
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
    let path = updateQueryStringParameter(`/${window.location.search}`, 'page', 1);
    Object.keys(value).forEach(i => {
      newData[i] = value[i];
      path = updateQueryStringParameter(path, i, value[i]);
    });

    newData.page = 1;
    setQuery(newData);
    navigate(path);
    // history.push(path);
  };

  return (
    <div className="search-page-wrapper">
      <div className="search-bg">
        <div className="search-area container container-mw-lg">
          <div className="title">{formatMessage(messages.searchOurCatalog)}</div>
          <SearchField
            submitButtonLocation="external"
            buttonText={formatMessage(messages.Search)}
            placeholder={formatMessage(messages.whatAreYouLookingFor)}
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
                {dropdownResponse.data.total > 5 && <li className="view-all-search-result"><a onClick={searchSubmittedHandle}>{formatMessage(messages.ViewAllResults)}</a></li>}
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
                { label: formatMessage(messages.Home), href: getConfig().LMS_BASE_URL },
              ]}
              activeLabel={formatMessage(messages.Search)}
            />
          </div>
          <div>
            <div>
              <div className="title">{formatMessage(messages.Courses)}</div>
              {searchResponse?.data.results.length > 0 && (searchQuery || query.language || query.org || query.run) && <p className="small">{searchResponse?.data.total} {formatMessage(messages.resultsOn)} {process.env.SITE_NAME}.</p>}
              <div className="card-list d-flex">
                {
                  !searchResponse && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <Card className="course-placeholder">
                      <div className="skeleton image-placeholder" />
                      <div className="skeleton first-line-placeholder" />
                      <div className="skeleton second-line-placeholder" />
                      <Card.Section>
                        <div className="space" />
                      </Card.Section>
                      <div className="skeleton third-line-placeholder" />
                    </Card>
                  ))
                }
                {
                    searchResponse && searchResponse.data.results.map((item) => (
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
                            <Badge variant="light">{formatMessage(messages.Course)}</Badge>
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
                          <div className="s-text mt-1">{formatMessage(messages.Start)}: {item.start ? new Date(item.start).toLocaleDateString() : ''}</div>
                        </Card.Footer>
                      </Card>
                    ))
                }
              </div>
              {
                  searchResponse && searchResponse.data.results.length === 0 && (
                  <div className="text-center">
                    <p>{formatMessage(messages.noCourseMatch)}.</p>
                    <div>
                      <Button size="sm" onClick={backToCoursesHandle} variant="link">{formatMessage(messages.backToSearch)}</Button>
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

export default Search;
