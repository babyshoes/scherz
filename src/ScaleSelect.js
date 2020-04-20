import React from 'react';
import { scaleIntervals } from 'scherz.util';
import _ from 'lodash';
import Multiselect from './Multiselect.js';


export default ({ selectedScales, selectScale, removeScale }) =>
  <div className="heading scales">
    <div style={{display: 'flex'}}>
      scales
      <Multiselect
        selected={selectedScales}
        options={_.orderBy(_.keys(scaleIntervals))}
        onSelect={selectScale}
        onRemove={removeScale}
        maxSelected={2}
      />
    </div>
    <div> (up to two) influence chord choices </div>
  </div>