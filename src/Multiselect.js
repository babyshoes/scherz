import React, { useState, useRef, useEffect } from 'react'


export default function Multiselect({ selected, options, onSelect, onRemove, maxSelected }) {
  const [isOpen, setIsOpen] = useState(false);

  const node = useRef(null);
  
  function renderOption(option) {
    const isSelected = selected.includes(option);
    const isDisabled = selected.length === maxSelected && !selected.includes(option);

    return (
      <div
        key={`option-${option}`}
        className={`option transition-opacity ${isSelected && 'selected'} ${isDisabled && 'disabled-cursor'}`}
        onClick={() => isSelected ? onRemove(option) : onSelect(option)}
      >
        {option}
      </div>
    )
  }

  const closeDropdown = (e) => !node.current.contains(e.target) && setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", closeDropdown);
    } else {
      document.removeEventListener("mousedown", closeDropdown);
    }

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, [isOpen]);

  return (
    <div ref={node} className="multiselect">
      { isOpen &&
        <div className="fade-in options">
          {options.map(renderOption)}
        </div> 
      }
      <div
        className={`dropdown ${isOpen && 'open'}`}
        onClick={() => isOpen ? setIsOpen(false) : setIsOpen(true)}
      >
        &#9660;
      </div>
      { !isOpen &&
        <div className="fade-in down">{selected.join(', ')}</div>
      }
    </div>
  )
}