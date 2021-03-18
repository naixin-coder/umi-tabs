import React, { useEffect } from 'react';
import { history, connect } from 'umi';
import { Inspector } from 'react-dev-inspector';

const InspectorWrapper = process.env.NODE_ENV === 'development' ? Inspector : React.Fragment;

const Layout = (props) => {
  const { dispatch, children } = props;
  // useEffect(() => {
  //   history.listen((location) => {
  //     console.log(location, children);
  //     if (dispatch) {
  //       dispatch({
  //         type: 'layout/saveRoute',
  //         payload: {
  //           path: location.pathname,
  //           children: children.children
  //         }
  //       })
  //     }
  //   })
  // }, [])
  return <InspectorWrapper>{children}</InspectorWrapper>;
};

export default connect(({ layout }) => ({
  layout,
}))(Layout);
