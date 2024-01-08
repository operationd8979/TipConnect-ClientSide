import {
    Home,
    Login,
    Register,
    MessageArea,
    Profile,
    HomeMessage,
    MovieDetail,
    WatchMovie,
    Dashboard,
    UserManage,
    MovieManage,
} from '../screens';
import { SidebarInclude } from '../layout';
import config from '../config';
import AdminLayout from '../layout/AdminLayout';

interface publicRoutes {
    path: string;
    component: () => JSX.Element;
    layout?: ({ children }: { children: JSX.Element }) => JSX.Element | null;
}

const publicRoutes: publicRoutes[] = [
    { path: config.routes.home, component: Home },
    { path: config.routes.login, component: Login },
    { path: config.routes.register, component: Register },
    { path: config.routes.message, component: MessageArea, layout: SidebarInclude },
    { path: config.routes.profile, component: Profile },
    { path: config.routes.homeMessage, component: HomeMessage, layout: SidebarInclude },
    { path: config.routes.movieDetail, component: MovieDetail },
    { path: config.routes.streaming, component: WatchMovie },
    { path: config.routes.dashBoard, component: Dashboard, layout: AdminLayout },
    { path: config.routes.userManager, component: UserManage, layout: AdminLayout },
    { path: config.routes.content, component: MovieManage, layout: AdminLayout },
];

const privateRoutes = [null];

export { publicRoutes, privateRoutes };
