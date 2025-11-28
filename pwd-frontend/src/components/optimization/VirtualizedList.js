import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

/**
 * Virtual scrolling component for large lists
 * Only renders visible items to improve performance
 */
export function VirtualizedList({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5, // Number of items to render outside visible area
  ...props
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length, visibleEnd + overscan);
    
    return {
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: containerHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        ...props.sx,
      }}
      {...props}
    >
      {/* Spacer for items before visible range */}
      <Box sx={{ height: startIndex * itemHeight }} />
      
      {/* Render visible items */}
      {visibleItems.map(({ item, index }) => (
        <Box
          key={index}
          sx={{
            height: itemHeight,
            position: 'relative',
          }}
        >
          {renderItem(item, index)}
        </Box>
      ))}
      
      {/* Spacer for items after visible range */}
      <Box sx={{ height: (items.length - endIndex) * itemHeight }} />
    </Box>
  );
}

export default VirtualizedList;

