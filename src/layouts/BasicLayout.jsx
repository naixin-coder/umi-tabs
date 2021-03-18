/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer } from '@ant-design/pro-layout';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useIntl, connect, history } from 'umi';
import { GithubOutlined, DeleteOutlined } from '@ant-design/icons';
import { Result, Button, Tabs } from 'antd';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getMatchMenu } from '@umijs/route-utils';
import logo from '../assets/logo.svg';

const TabPane = Tabs.TabPane;
const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList) =>
  menuList.map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return localItem;
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 蚂蚁集团体验技术部出品`}
    links={[
      {
        key: 'Ant Design Pro',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/ant-design/ant-design-pro',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: 'Ant Design',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);



// 获取缓存组件 Umi3 bug 不能直接缓存children 需找出组件来缓存，但不支持嵌套路由
const getComponent = (routes, pathname) => {
  // 普通路由
  let routeIndex = routes.findIndex((r) => r.path === pathname);

  // 约定式路由
  if (routeIndex === -1 && pathname.includes(':')) {
    routes.forEach((r, index) => {
      if (r.path.includes(':')) {
        if (r.path.substr(0, r.path.indexOf(':')) === pathname.substr(0, pathname.indexOf(':'))) {
          routeIndex = index;
        }
      }
    });
  }

  return routeIndex > -1 ? { ...routes[routeIndex], routeIndex } : undefined;
};

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
    layout: { routes }
  } = props;
  const [activeKey, setActiveKey] = useState(location.pathname)
  const menuDataRef = useRef([]);


  const getRoutes = (routes) => {
    const rs = routes || props.route.routes;
    return rs?.reduce((keys, item) => {
      keys.push(item);
      if (item.routes) {
        return keys.concat(getRoutes(item.routes));
      }
      return keys;
    }, []);
  }
  const [routeList] = useState(getRoutes);
  const routeInfo = getComponent(routeList, props.location.pathname);
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);

  const onPageChange = (e) => {
    if (e.pathname !== '/') {
      setActiveKey(e.pathname)
      if (dispatch) {
        const element = React.createElement(routeInfo.component);
        dispatch({
          type: 'layout/saveRoute',
          payload: {
            name: routeInfo.name,
            path: location.pathname,
            children: element
          }
        })
      }
    }
  }

  const handleMenuCollapse = (payload) => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const onEdit = (targetKey, action) => {
    if ('remove' === action) {
      dispatch({ type: 'layout/deleteRoute', payload: { path: targetKey } });
      if (routes.length >= 1) {
        setActiveKey(routes[routes.length - 1].path);
        window.history.pushState('', '', routes[routes.length - 1].path)
      }
    }
  };


  const renderContent = () => {
    if (location.pathname === '/') {
      return (<div>{children}</div>);
    } else {
      return (
        <Tabs onEdit={onEdit} activeKey={activeKey} type="editable-card" hideAdd onChange={(e) => { setActiveKey(e); window.history.pushState('', '', e) }}>
          {
            routes.map(route => <TabPane closeIcon={<DeleteOutlined />} tab={route.name} key={route.path}>{route.children}</TabPane>)
          }
        </Tabs>
      );
    }
  }
  const { formatMessage } = useIntl();
  return (
    <>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        {...props}
        {...settings}
        onCollapse={handleMenuCollapse}
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (
            menuItemProps.isUrl ||
            !menuItemProps.path ||
            location.pathname === menuItemProps.path
          ) {
            return defaultDom;
          }
          // return <p to={menuItemProps.path}>{defaultDom}</p>;
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        onPageChange={onPageChange}
        postMenuData={(menuData) => {
          menuDataRef.current = menuData || [];
          return menuData || [];
        }}
      >
        {renderContent()}
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={(config) =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  );
};

export default connect(({ global, settings, layout }) => ({
  collapsed: global.collapsed,
  settings,
  layout,
}))(BasicLayout);
