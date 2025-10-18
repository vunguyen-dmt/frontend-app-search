import React from 'react';
import PropTypes from 'prop-types';
import { Button, ModalPopup, useToggle, Form } from '@openedx/paragon';
import { ArrowDropDown } from '@openedx/paragon/icons';
import './FilterItemCheckbox.scss';

export const FilterItemCheckbox = ({
  value,
  data,
  title,
  filterName,
  onChange,
}) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState(null);

  const handleChange = (e) => {
    const { value: item, checked } = e.target;
    const newValues = checked
      ? [...value, item]
      : value.filter(i => i !== item);
    onChange({ filterName, values: newValues });
  };

  return (
    <div className="filter-item-checkbox-wrapper">
      <Button
        variant="outline-primary"
        ref={setTarget}
        className={value.length > 0 ? 'filter-item-toggle has-value' : 'filter-item-toggle'}
        onClick={open}
        iconAfter={ArrowDropDown}
        aria-label={`Open ${title} filter dropdown`}
        aria-expanded={isOpen}
        aria-controls="filter-modal"
      >
        {title}
      </Button>
      <div className="filter-item-dropdown">
        <ModalPopup positionRef={target} isOpen={isOpen} onClose={close} id="filter-modal">
          <Form.Group>
            <Form.CheckboxSet
              name={filterName}
              onChange={handleChange}
              value={value}
            >
              {data?.map((item) => (
                item.vKey ? (
                  <Form.Checkbox key={item.vKey} value={item.vKey}>
                    {item.name}
                  </Form.Checkbox>
                ) : null
              ))}
            </Form.CheckboxSet>
          </Form.Group>
        </ModalPopup>
      </div>
    </div>
  );
};

FilterItemCheckbox.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      vKey: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  filterName: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

FilterItemCheckbox.defaultProps = {
  value: [],
};

// export default React.memo(FilterItemCheckbox);