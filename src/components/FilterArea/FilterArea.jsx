import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Chip, Button } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { FilterItemRadio } from '../FilterItemRadio/FilterItemRadio';
import './FilterArea.scss';
import messages from '../../messages/messages';
import * as qs from 'qs';
import { languageDict } from '../../data/languageCode';

const FilterArea = ({ data, onChange }) => {
  const { formatMessage } = useIntl();
  const filters = ['language', 'org', 'run'];
  const filterValues = {};
  filters.forEach(i => {
    filterValues[i] = null;
  });
  const [filterData, setFilterData] = React.useState(filterValues);
  const [chipBag, setChipBag] = React.useState([]);
  React.useEffect(() => {
    const queryParams = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const newChipBag = [];
    const newFilterData = {};
    let dataChanged = false;
    Object.keys(queryParams).forEach(i => {
      if (filters.includes(i)) {
        dataChanged = true;
        newChipBag.push({ key: i, value: queryParams[i] });
        newFilterData[i] = queryParams[i];
      }
    });
    if (dataChanged) {
      setFilterData(newFilterData);
      setChipBag(newChipBag);
      onChange(newFilterData);
    }
  }, []);

  const handleFilterItemChange = (item) => {
    const newFilterData = { ...filterData };
    newFilterData[item.filterName] = item.value;
    setFilterData(newFilterData);
    onChange(newFilterData);
    const newChipBag = [];
    Object.keys(newFilterData).forEach(i => {
      if (newFilterData[i]) {
        newChipBag.push({ key: i, value: newFilterData[i] });
      }
    });

    setChipBag(newChipBag);
  };

  const handleRemovechip = (value) => {
    const newChipBag = [];
    chipBag.forEach(i => {
      if (i.key !== value) {
        newChipBag.push(i);
      }
    });
    setChipBag(newChipBag);
    const newFilterData = { ...filterData };
    newFilterData[value] = null;
    setFilterData(newFilterData);
    onChange(newFilterData);
  };

  const handleClearAll = () => {
    setChipBag([]);
    const newFilterData = {};
    filters.forEach(i => {
      newFilterData[i] = null;
    });
    setFilterData(newFilterData);
    onChange(newFilterData);
  };

  return (
    <div className="filter-area-wrapper">
      <div className="filter-area container container-mw-lg">
        <div className="d-flex filter-items">
          <FilterItemRadio value={filterData.language} onChange={handleFilterItemChange} title={formatMessage(messages.language)} data={data.languages} filterName="language" />
          <FilterItemRadio value={filterData.org} onChange={handleFilterItemChange} title={formatMessage(messages.facultyCode)} data={data.orgs} filterName="org" />
          <FilterItemRadio value={filterData.run} onChange={handleFilterItemChange} title={formatMessage(messages.courseRun)} data={data.runs} filterName="run" />
        </div>
        <div className="selected-filters">
          {
            chipBag.map(item => (
              <Chip
                key={item.key}
                iconAfter={Close}
                onIconAfterClick={() => handleRemovechip(item.key)}
              >
                {item.key === 'language' && item.value in languageDict ? languageDict[item.value].name : item.value}
              </Chip>
            ))
          }
          {
            Object.entries(chipBag).length > 0 && <Button variant="tertiary" className="mb-2 mb-sm-0 clear" onClick={handleClearAll}>{formatMessage(messages.clearAll)}</Button>
          }
        </div>
      </div>
    </div>
  );
};

export default FilterArea;
