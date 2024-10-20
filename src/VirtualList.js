import React, { useState, useEffect, useRef } from 'react';

const VirtualList = ({ items, renderItem, itemHeight, windowHeight }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(listRef.current.scrollTop);
    };

    const listRefCurrent = listRef.current;
    listRefCurrent.addEventListener('scroll', handleScroll);

    return () => {
      listRefCurrent.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(windowHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={listRef}
      style={{ height: windowHeight, overflowY: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualList;