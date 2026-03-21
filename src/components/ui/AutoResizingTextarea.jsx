import React, { useState, useEffect, useRef } from 'react';

export default function AutoResizingTextarea({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  rows = "1", 
  title 
}) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onInput={adjustHeight} 
      placeholder={placeholder}
      className={`${className} overflow-hidden`} 
      rows={rows}
      title={title}
    />
  );
}
