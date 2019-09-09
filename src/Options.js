import React, { useLayoutEffect, useRef } from 'react';
import './App.css';
import { util } from 'scherz'

const scaleOptions = util.scales

const Options = ({selectedScales, tonic, possibleTypes, onScaleSelect, onScaleRemove, onTonicChange, onTypeChange, play})  => {
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

  // useLayoutEffect(() => {
  //     const optionsDiv = ref.current
  //     if(play) { // hide options
  //       optionsDiv.classList.add("shift-off")
  //       optionsDiv.parentElement.classList.add("invisible")
  //     } else {
  //       optionsDiv.classList.remove("shift-off")
  //       optionsDiv.parentElement.classList.remove("invisible")
  //     }     
  // }, [possibleTypes])

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
    
    if (tonic.length > 0) {
      const baseNote = tonic[0].toLowerCase()
      const accidentals = new Set(tonic.slice(1))

      if ("cdefgab".includes(baseNote) 
        && (accidentals.size === 0
          || (accidentals.size === 1 && (accidentals.has("b") || accidentals.has("#"))))
        ) {
          onTonicChange(baseNote.toUpperCase() + tonic.slice(1))
        }
    }
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
      // return <li><label key={`type-label-${i}`} htmlFor={type}>{type}</label></li>
    })
  }

  return (
    <div ref={ref} id="options-div" >
      <h2>Tonic / Chord</h2>
      <div>
        <input className="options" type="text" name="tonic" onChange={validateTonicSelection} value={tonic}/>
        {/* <div className="box"> */}
          <select className="dropdown" onChange={validateTypeSelection}>
            {makeTypesDropdown()}
          </select>
        {/* </div> */}
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