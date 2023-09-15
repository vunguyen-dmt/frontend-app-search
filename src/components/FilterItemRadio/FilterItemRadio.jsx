import React from 'react';
import {
  Menu, MenuItem, Button, ModalPopup, useToggle, Form,
} from '@edx/paragon';
import { ArrowDropDown } from '@edx/paragon/icons';
import './FilterItemRadio.scss';
import { languageDict } from '../../data/languageCode';

// eslint-disable-next-line import/prefer-default-export
export const FilterItemRadio = ({
  value, data, title, filterName, onChange,
}) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState(null);
  const handleChange = (item) => {
    onChange(item);
  };

  return (
    <div className="filter-item-radio-wrapper">
      <Button variant="outline-primary" ref={setTarget} className={value ? 'filter-item-toggle has-value' : 'filter-item-toggle'} onClick={open} iconAfter={ArrowDropDown}>{title}</Button>
      <div className="filter-item-dropdown">
        <ModalPopup positionRef={target} isOpen={isOpen} onClose={close}>
          <Form.Group>
            <Form.RadioSet
              name={filterName}
              onChange={(e) => handleChange({ filterName, value: e.target.value })}
              value={value}
            >
              <Menu>
                {
                  data && data.map((item) => (
                    <MenuItem key={item} as={Form.Radio} value={item}>{filterName === 'language' && item in languageDict ? languageDict[item].nativeName : item}</MenuItem>
                  ))
                }
              </Menu>
            </Form.RadioSet>
          </Form.Group>
        </ModalPopup>
      </div>
    </div>
  );
};
