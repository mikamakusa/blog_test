export default {
  routes: [
    {
      method: 'GET',
      path: '/stats',
      handler: 'stats.getStats',
      config: {
        policies: [],
        middlewares: [],
     },
    },
  ],
};
