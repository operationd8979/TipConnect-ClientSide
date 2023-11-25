import { Home, Login, Register, MessageArea, Profile } from '../screens';
import { SidebarInclude } from '../layout';
import config from '../config';

interface publicRoutes {
    path: string;
    component: () => JSX.Element;
    layout?: ({ children }: { children: JSX.Element }) => JSX.Element | null;
}

const publicRoutes: publicRoutes[] = [
    { path: config.routes.home, component: Home, layout: SidebarInclude },
    { path: config.routes.login, component: Login },
    { path: config.routes.register, component: Register },
    { path: config.routes.message, component: MessageArea, layout: SidebarInclude },
    { path: config.routes.profile, component: Profile },
];

const privateRoutes = [null];

export { publicRoutes, privateRoutes };
