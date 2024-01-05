import React, {useEffect, useState} from 'react';
import inputData from './api/block_data.json';
import './App.css';

function App() {
  const [containerSize, setContainerSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight - 16,
  });
  
  useEffect(() => {
    const updateContainerSize = () => {
      setContainerSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight - 16,
      });
    };
    
    window.addEventListener('resize', updateContainerSize);
    
    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);
  
  const colorMap = {};
  
  const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };
  
  const getColor = (width, height) => {
    const sizeKey = `${width}-${height}`;
    if (!colorMap[sizeKey]) {
      colorMap[sizeKey] = getRandomColor();
    }
    return colorMap[sizeKey];
  };
  
  const fillBlockPlacement = (data) => {
    
    let fullness = 0;
    let blockCoordinates = [];
    
    const space = Array.from({ length: containerSize.width }, (_, index) => ({ height: 0 }));
    
    const blocksList = [...data]
      .map((block, index) => ({
        ...block,
        id: `${index + 1}`
      }))
      .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    const rows = [[]];
    
    for (const block of blocksList) {
      let optimalRow = null;
      let minRemainder = Infinity;
      
      if (block.width > containerSize.width || block.height > containerSize.height) {
        if (block.width <= containerSize.height && block.height <= containerSize.width) {
          [block.width, block.height] = [block.height, block.width];
        } else {
          continue;
        }
      }
      
      for (const row of rows) {
        const rowHeight = Math.max(...row.map(b => b.height));
        const rowRemainingWidth = containerSize.width - row.reduce((sum, b) => sum + b.width, 0);
        
        if (block.width <= rowRemainingWidth && block.height <= containerSize.height - rowHeight) {
          const remainder = rowRemainingWidth - block.width;
          if (remainder < minRemainder) {
            minRemainder = remainder;
            optimalRow = row;
          }
        }
      }
      
      if (!optimalRow) {
        rows.push([block]);
      } else {
        optimalRow.push(block);
      }
    }
    
    rows.forEach(blocks => {
      let left = 0;
      
      blocks.forEach(block => {
        let fixHeight = null;
        
        for (let i = left; i < left + block.width; i++) {
          fixHeight = fixHeight || space[i].height;
          space[i].height = fixHeight + block.height;
        }
        
        blockCoordinates.push({
          top: containerSize.height - (fixHeight ? fixHeight + block.height : block.height),
          left: left,
          right: containerSize.width - left - block.width,
          bottom: fixHeight ? fixHeight : 0,
          initialOrder: block.id,
        })
        
        left += block.width;
      });
    });
    
    const totalAreaBlock = blockCoordinates.reduce((sum, x) => sum + (containerSize.width - x.left - x.right) * (containerSize.height - x.bottom - x.top), 0);
    const totalSpace = space.reduce((sum, {height}) => sum + height, 0);
    const emptySpace = totalSpace - totalAreaBlock;
    
    fullness = (1 - emptySpace / (emptySpace + totalAreaBlock)) * 100;
    
    return {
      fullness,
      blockCoordinates
    };
  }
  
  const {fullness, blockCoordinates} = fillBlockPlacement(inputData);
  
  return (
    <main>
      <p>{`Fullness is ${fullness}`}</p>
      <div className='block' style={{ width: containerSize.width, height: containerSize.height }}>
        {blockCoordinates.map((block) => {
          const width = containerSize.width - block.left - block.right;
          const height = containerSize.height - block.bottom - block.top;
          
          return (
            <span
              key={block.initialOrder}
              style={{
                position: 'absolute',
                top: block.top,
                bottom: block.bottom,
                left: block.left,
                right: block.right,
                width: width,
                height: height,
                border: '1px solid #000',
                boxSizing: 'border-box',
                background: getColor(width, height),
              }}
            >
              <p className='block_initOrder'>
                {block.initialOrder}
              </p>
            </span>
          )
        })}
      </div>
    </main>
  );
}

export default App;
