const routes = {
    home: '/',
    message: '/message/:relationShipID',
    login: '/login',
    register: '/register',
    profile: '/profile',
    watchMovie: '/watch/:id',
    homeMessage: '/homeMessage',
    movieDetail: '/:id',
    streaming: '/streaming/:id',
    dashBoard: '/admin/dashboard',
    //careful with this route
    content: '/admin/content',
    analytics: '/admin/analytics',
    comments: '/admin/comments',
    subtitles: '/admin/subtitles',
    copyright: '/admin/copyright',
    customisation: '/admin/customisation',
    setting: '/admin/setting',
    uploadMovie: '/admin/upload',
    userManager: '/admin/user',
    pricing: '/user/pricing',
};

export default routes;
