import { Home, Login, Register, MessageArea, Profile } from '../screens';
import { OnlyHeader } from '../layout';
import config from '../config';
import StompProvider from '../websocket/Websocket';

interface publicRoutes {
    path: string;
    component: () => JSX.Element;
    layout?: ({ children }: { children: JSX.Element }) => JSX.Element | null;
}

const publicRoutes: publicRoutes[] = [
    { path: config.routes.home, component: Home },
    { path: config.routes.login, component: Login, layout: OnlyHeader },
    { path: config.routes.register, component: Register, layout: OnlyHeader },
    { path: config.routes.message, component: MessageArea },
    { path: config.routes.profile, component: Profile, layout: OnlyHeader },
];

const privateRoutes = [null];

export { publicRoutes, privateRoutes };
