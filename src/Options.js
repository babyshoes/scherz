import React from 'react';
import './App.css';
import { util } from 'scherz'

const scaleOptions = util.scales

const Options = ({selectedScales, tonic, onScaleSelect, onScaleRemove, onTonicChange})  => {

  const validateScaleSelection = (e) => {
    const scale = e.target.id
    // debugger
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
          onTonicChange(tonic.toUpperCase())
        }
    }
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



  return (
    <div id="options-div" >
      <h2>Tonic</h2>
      <div>
        <input className="options" type="text" name="tonic" onChange={validateTonicSelection} value={tonic}/>
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