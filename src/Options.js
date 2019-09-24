import React, { useLayoutEffect, useRef } from 'react';
import './App.css';
import { util } from 'scherz'
import _ from 'lodash'

const scaleOptions = util.scales

const Options = ({selectedScales, tonic, tonicError, possibleTypes, onScaleSelect, onScaleRemove, onTonicChange, onTypeChange, play})  => {
  const ref = useRef(null)

  useLayoutEffect(() => {
      const optionsDiv = ref.current
      if(play) { // hide options
        optionsDiv.classList.add("shift-off")
        optionsDiv.parentElement.classList.add("invisible")
      } else {
        optionsDiv.classList.remove("shift-off")
        optionsDiv.parentElement.classList.remove("invisible")
      }     
  }, [play])

  const validateScaleSelection = (e) => {
    const scale = e.target.id
    if(e.target.checked && selectedScales.length + 1 < 4) {
        e.target.classList.add("checked")
        onScaleSelect(scale)
    } else if(selectedScales.length > 1) {
        e.target.classList.remove("checked")
        onScaleRemove(scale)
    } 
  }

  const validateTonicSelection = (e) => {
    const tonic = e.target.value
    onTonicChange(tonic)
  }

  const delayValidate = (e) => {
    return _.debounce(validateTonicSelection, 150)
  }

  const validateTypeSelection = (e) => {
    const type = e.target.value

    onTypeChange(type)
  }

  const makeChecklist = () => {
    return scaleOptions.map((scale, index) => {
      const checked = selectedScales.includes(scale) ? "checked" : ""
      return <div key={index}>
        <input className={`checkbox ${checked}`} key={`scale-${index}`} id={scale} type="checkbox" onChange={validateScaleSelection}/> 
        <label key={`scale-label-${index}`} htmlFor={scale}>{scale}</label>
      </div>
    })
  }

  const makeTypesDropdown = () => {
    return possibleTypes.map((type, i) => {
      return <option key={`type-label-${i}`} >{type}</option>
    })
  }

  return (
    <div ref={ref} id="options-div" >
      <h2>Tonic / Chord</h2>
      <div>
        <input className="options" type="text" name="tonic" onChange={validateTonicSelection} value={tonic}/>
          <select className="dropdown" onChange={validateTypeSelection}>
            {makeTypesDropdown()}
          </select>
        <div className="error">
          <p className="error-text">{tonicError}</p>
        </div>
        
      </div>
      <br/>
      <h2>Scales</h2>
      
      <div className="scale-list">
      {makeChecklist()}
      </div>
      <div>
        
      </div>
    </div>
  );
}
  
  export default Options;