import React from 'react';
import { Chip, Button } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import { FilterItemRadio } from '../FilterItemRadio/FilterItemRadio';
import './FilterArea.scss';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from '../../messages/messages';
import * as qs from 'qs';
import { languageDict } from '../../data/languageCode';

const FilterArea = ({ aggs, onChange, intl }) => {
  const [filterData, setFilterData] = React.useState({ language: null, org: null });
  const [chipBag, setChipBag] = React.useState([]);
  React.useEffect(() => {
    const { language } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const { org } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    if (language || org) {
      const newFilterData = {
        language,
        org,
      };
      setFilterData(newFilterData);
      const newChipBag = [];
      if (language) {
        newChipBag.push({ key: 'language', value: newFilterData.language });
      }
      if (org) {
        newChipBag.push({ key: 'org', value: newFilterData.org });
      }
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
    if (newFilterData.language) {
      newChipBag.push({ key: 'language', value: newFilterData.language });
    }
    if (newFilterData.org) {
      newChipBag.push({ key: 'org', value: newFilterData.org });
    }
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
    const newFilterData = { language: null, org: null };
    setFilterData(newFilterData);
    onChange(newFilterData);
  };

  return (
    <div className="filter-area-wrapper">
      <div className="filter-area container container-mw-lg">
        <div className="d-flex filter-items">
          <FilterItemRadio value={filterData.language} onChange={handleFilterItemChange} title={intl.formatMessage(messages.language)} data={aggs.language.terms} filterName="language" />
          <FilterItemRadio value={filterData.org} onChange={handleFilterItemChange} title="Org" data={aggs.org.terms} filterName="org" />
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
            Object.entries(chipBag).length > 0 && <Button variant="tertiary" className="mb-2 mb-sm-0 clear" onClick={handleClearAll}>{intl.formatMessage(messages.clearAll)}</Button>
          }
        </div>
      </div>
    </div>
  );
};

FilterArea.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(FilterArea);
