import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  SearchField, Collapsible, Menu, MenuItem, Form, Chip,
  Button, Breadcrumb, Icon, Hyperlink, Pagination, Card, Badge,
} from '@edx/paragon';
import { Close, Home } from '@edx/paragon/icons';
import * as qs from 'qs';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { searchCourse } from '../../services/courseService';
import './search.scss';
import messages from '../../messages/messages';

const Search = ({ intl }) => {
  const parsePage = () => {
    const page = Number(qs.parse(window.location.search, { ignoreQueryPrefix: true }).page);
    return isInt(page) ? Number(page) : 1;
  };

  const parseQuery = () => {
    const { q } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    return q || '';
  };

  const [searchQuery, setSearchQuery] = React.useState(parseQuery());
  const [dropdownCourses, setDropdownCourses] = React.useState([]);
  const [searchResponse, setSearchResponse] = React.useState(null);
  const [numberOfPage, setNumberOfPage] = React.useState(1);
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
    window.scrollTo(0, 0);
    setTimeout(() => {
      clearTimeout(searchDropdownTimerId);
    });
    searchCourse(query).then(response => {
      setSearchResponse(response);
      setNumberOfPage(Math.ceil(response.data.total / numberOfItemPerPage));
    });

    history.push(`/?page=${query.page}&q=${encodeURIComponent(query.query)}`);
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
          limit: 11,
          query: searchQuery,
        }).then(response => {
          setDropdownCourses(response.data.results);
        });
      }, delay);
    }
    return () => {
      clearTimeout(searchDropdownTimerId);
    };

    // if (searchQuery && renderCount.current > 1 && !hitSearch) {
    //   searchCourse({
    //     page: 1,
    //     limit: 11,
    //     query: searchQuery,
    //   }).then(response => {
    //     setDropdownCourses(response.data.results);
    //   });
    // }
    // renderCount.current++;
  }, [searchQuery]);

  window.onpopstate = () => {
    setQuery({
      page: parsePage(),
      limit: numberOfItemPerPage,
      query: parseQuery(),
    });
  };

  const pagingClickedHandle = (page) => {
    setQuery({ ...query, page });
  };

  const searchBoxOnChangeHandle = async (value) => {
    if (searchQuery !== value) {
      setSearchQuery(value);
    }
  };

  const searchSubmittedHandle = () => {
    clearTimeout(searchDropdownTimerId);
    setDropdownCourses([]);
    setQuery({ ...query, query: searchQuery });
  };

  return (
    <div>
      <div className="search-bg">
        <div className="search-area container">
          <div className="title">{intl.formatMessage(messages['Search our catalog'])}</div>
          <SearchField
            submitButtonLocation="external"
            buttonText={intl.formatMessage(messages.Search)}
            placeholder={intl.formatMessage(messages['What are you looking for?'])}
            value={searchQuery}
            onSubmit={searchSubmittedHandle}
            onChange={searchBoxOnChangeHandle}
          />
          {
            dropdownCourses.length > 0
            && (
            <div className="search-dropdown shadow-lg">
              <ul>
                {
                dropdownCourses.map((item) => (
                  <li key={item.id}><a href={`${getConfig().LMS_BASE_URL}/courses/${item.data.id}/about`}>{item.data.content.display_name} <Badge variant="light">{item.data.org}</Badge> <Badge variant="light">{item.data.number}</Badge></a></li>
                ))
              }
                {dropdownCourses.length > 10 && <li className="view-all-search-result"><a onClick={searchSubmittedHandle}>{intl.formatMessage(messages['View all results'])}</a></li>}
              </ul>
            </div>
            )
          }
        </div>
      </div>
      {/* <div className="filter-area-wrapper">
        <div className="filter-area container">
          <div>
            <Collapsible title="Availability" className="availability">
              <Menu>
                <MenuItem as={Form.Checkbox}>Available Now</MenuItem>
                <MenuItem as={Form.Checkbox}>Upcomming</MenuItem>
                <MenuItem as={Form.Checkbox}>Archieved</MenuItem>
              </Menu>
            </Collapsible>
          </div>
          <div className="selected-filters">
            <Chip
              iconAfter={Close}
              onIconAfterClick={() => console.log('Remove Chip')}
            >
              Available Now
            </Chip>
            <Button variant="tertiary" className="mb-2 mb-sm-0 clear">Clear all</Button>
          </div>
        </div>
      </div> */}
      <div className="search-result-wrapper">
        <div className="search-result container">
          <div className="page-nav d-flex">
            <Hyperlink destination={process.env.LMS_BASE_URL} className="mr-1">
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
              {searchResponse?.data.results.length > 0 && searchQuery && <p className="small">{searchResponse?.data.total} {intl.formatMessage(messages['results on'])} {process.env.SITE_NAME}.</p>}
              <div className="card-list d-flex">
                {
                    searchResponse?.data.results.map((item) => (
                      <Card
                        key={item.data.id}
                        as={Hyperlink}
                        destination={`${getConfig().LMS_BASE_URL}/courses/${item.data.id}/about`}
                        isClickable
                      >

                        <Card.ImageCap
                          src={`${getConfig().LMS_BASE_URL}${item.data.image_url}`}
                          srcAlt="course image"
                        />
                        <div className="org-and-number">
                          <div>
                            <Badge variant="light">{intl.formatMessage(messages.Course)}</Badge>
                          </div>
                          <div>{item.data.org}</div>
                          <div>{item.data.number}</div>
                        </div>
                        <Card.Header
                          title={item.data.content.display_name}
                        />
                        <Card.Section>
                          <div className="space" />
                        </Card.Section>
                        <Card.Footer>
                          <div className="small mt-1">{intl.formatMessage(messages.Start)}: {item.data?.start ? new Date(item.data.start).toLocaleDateString() : ''}</div>
                        </Card.Footer>
                      </Card>
                    ))
                }
              </div>
              {
                  searchResponse && searchResponse.data.results.length === 0 && (
                  <div className="text-center">
                    <p>{intl.formatMessage(messages['No courses were found to match your search query'])}.</p>
                    <p><a href="/search">{intl.formatMessage(messages['Back to search'])}</a>.</p>
                  </div>
                  )
              }
            </div>
            {
              numberOfPage > 1
              && (
              <div className="search-paging">
                <Pagination
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