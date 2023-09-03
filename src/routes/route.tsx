import { Home, Login, Register } from '../screens';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
];

const privateRoutes = [null];

export { publicRoutes, privateRoutes };
