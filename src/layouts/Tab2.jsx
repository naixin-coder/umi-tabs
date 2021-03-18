import React, { useEffect } from 'react';

const Tab2 = () => {
  useEffect(() => {
    alert(2);
  }, [])
  return (<div>Tab2</div>)
}

export default Tab2;