import { Home, Login, Register } from '../screens';

const publicRoutes: { path: string; component: () => JSX.Element; layout?: string | null }[] = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register, layout: null },
];

const privateRoutes = [null];

export { publicRoutes, privateRoutes };
