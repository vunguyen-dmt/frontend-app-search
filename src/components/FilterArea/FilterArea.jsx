import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Chip, Button } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { FilterItemCheckbox } from '../FilterItemCheckbox/FilterItemCheckbox';
import './FilterArea.scss';
import messages from '../../messages/messages';
import * as qs from 'qs';
import { languageDict } from '../../data/languageCode';

const FilterArea = ({ data, onChange }) => {
  const { formatMessage } = useIntl();
  const filters = ['language', 'org', 'run'];
  const [filterData, setFilterData] = React.useState({
    language: [],
    org: [],
    run: [],
  });
  const [chipBag, setChipBag] = React.useState([]);

  // Initialize from query parameters on mount
  useEffect(() => {
    const queryParams = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const newFilterData = { ...filterData };
    const newChipBag = [];
    let dataChanged = false;

    filters.forEach((filterName) => {
      if (queryParams[filterName]) {
        const terms = Array.isArray(queryParams[filterName])
          ? queryParams[filterName]
          : queryParams[filterName].split(',').filter(term => term);
        newFilterData[filterName] = terms;
        terms.forEach(term => {
          newChipBag.push({ filterName, value: term });
        });
        dataChanged = true;
      }
    });

    if (dataChanged) {
      setFilterData(newFilterData);
      setChipBag(newChipBag);
      onChange(newFilterData);
    }
  }, []); // Empty dependency array to run only on mount

  const handleFilterItemChange = ({ filterName, values }) => {
    const newFilterData = { ...filterData, [filterName]: values };
    setFilterData(newFilterData);
    onChange(newFilterData);

    // Rebuild chipBag from newFilterData
    const newChipBag = [];
    filters.forEach((filter) => {
      if (newFilterData[filter]?.length > 0) {
        newFilterData[filter].forEach(term => {
          newChipBag.push({ filterName: filter, value: term });
        });
      }
    });
    setChipBag(newChipBag);
  };

  const handleRemoveChip = ({ filterName, value }) => {
    const newFilterData = { ...filterData };
    newFilterData[filterName] = newFilterData[filterName].filter(item => item !== value);
    setFilterData(newFilterData);
    onChange(newFilterData);

    const newChipBag = chipBag.filter(chip => !(chip.filterName === filterName && chip.value === value));
    setChipBag(newChipBag);
  };

  const handleClearAll = () => {
    const newFilterData = { language: [], org: [], run: [] };
    setFilterData(newFilterData);
    setChipBag([]);
    onChange(newFilterData);
  };

  return (
    <div className="filter-area-wrapper">
      <div className="filter-area container container-mw-lg">
        <div className="d-flex filter-items">
          <FilterItemCheckbox
            value={filterData.org}
            onChange={handleFilterItemChange}
            title={formatMessage(messages.facultyCode)}
            data={data.orgs}
            filterName="org"
          />
          <FilterItemCheckbox
            value={filterData.run}
            onChange={handleFilterItemChange}
            title={formatMessage(messages.courseRun)}
            data={data.runs}
            filterName="run"
          />
        </div>
        <div className="selected-filters">
          {chipBag.map((item, index) => (
            <Chip
              key={`${item.filterName}-${item.value}-${index}`}
              iconAfter={Close}
              onIconAfterClick={() => handleRemoveChip(item)}
            >
              {item.filterName === 'language' && languageDict[item.value]
                ? languageDict[item.value].nativeName
                : item.value}
            </Chip>
          ))}
          {chipBag.length > 0 && (
            <Button
              variant="tertiary"
              className="mb-2 mb-sm-0 clear"
              onClick={handleClearAll}
              aria-label={formatMessage(messages.clearAll)}
            >
              {formatMessage(messages.clearAll)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

FilterArea.propTypes = {
  data: PropTypes.shape({
    languages: PropTypes.arrayOf(
      PropTypes.shape({
        vKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    ).isRequired,
    orgs: PropTypes.arrayOf(
      PropTypes.shape({
        vKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    ).isRequired,
    runs: PropTypes.arrayOf(
      PropTypes.shape({
        vKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FilterArea;