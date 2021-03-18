/*
 * @Author: 刘林
 * @Date: 2021-03-17 16:54:56
 * @LastEditors: 刘林
 * @LastEditTime: 2021-03-18 15:08:26
 */

const LayoutModel = {
  namespace: 'layout',
  state: {
    routes: []
  },
  effects: {
    *saveRoute({ payload, }, { put, select }) {
      const { routes } = yield select((state) => state.layout);
      const index = routes.findIndex((route) => route.path === payload.path);
      let newRoutes = routes;
      if (index === -1) {
        newRoutes = [...routes, payload]
      }
      yield put({ type: 'save', payload: { routes: newRoutes } })
    },
    *deleteRoute({ payload }, { put, select }) {
      const { routes } = yield select((state) => state.layout);
      const index = routes.findIndex((route) => route.path === payload.path);
      let newRoutes = routes;
      if (index > -1 && newRoutes.length > 1) {
        newRoutes.splice(index, 1);
      }
      yield put({ type: 'save', payload: { routes: newRoutes } })
    },
    *clearRoute(_, { put }) {
      yield put({ type: 'save', payload: { routes: [] } })
    }
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    }
  }
}

export default LayoutModel;

