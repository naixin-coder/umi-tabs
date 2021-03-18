import React, { useEffect } from 'react';

const Tab1 = () => {
  useEffect(() => {
    alert(1);
  }, [])
  return (<div>Tab1</div>)
}

export default Tab1;