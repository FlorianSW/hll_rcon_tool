import React, {useEffect, useRef, useState} from 'react';
import {
    AppLayout,
    BreadcrumbGroup,
    Flashbar,
    FlashbarProps,
    SideNavigation,
    TopNavigation,
} from '@cloudscape-design/components';
import {Notification, Notifications} from './notifications';
import {createBrowserRouter, LoaderFunction, Outlet, useLoaderData, useLocation} from 'react-router-dom';
import Start from './start/start';
import {UserInformation, UserinfoService} from './userinfo.service';
import {firstValueFrom} from 'rxjs';
import LoginAction, {LoginActionRef} from './login-action';
import {services, useServices} from "./di";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        id: 'MAIN_ROUTE',
        loader: mainLoader(services.userinfoService, services.notifications),
        children: [{
            path: '',
            element: <Start/>,
        }]
    },
]);

export const MainRouteId = 'MAIN_ROUTE';

export interface MainRouteData {
    user: UserInformation,
}

function mainLoader(ui: UserinfoService, notifications: Notifications): LoaderFunction {
    return async (p) => {
        const user = await firstValueFrom(notifications.connectTo(ui.info()));
        return {
            user: user,
        } as MainRouteData;
    }
}

interface followEvent extends Omit<Partial<CustomEvent>, 'preventDefault'>, Pick<CustomEvent, 'preventDefault'> {
    detail: {
        href: string | undefined,
        external?: boolean,
    },
}

export function routerFollower(e: followEvent) {
    if (e.detail.external) {
        return;
    }

    e.preventDefault();
    if (!!e.detail.href) {
        router.navigate(e.detail.href).catch((e) => services.notifications.error('Navigation errored: ' + e));
    }
}

function App() {
    const {notifications, userinfoService} = useServices();
    const [messages, setMessages] = useState<FlashbarProps.MessageDefinition[]>([]);
    const [user, setUser] = useState<UserInformation | undefined>(undefined);
    const data = useLoaderData() as MainRouteData;
    const location = useLocation();
    useEffect(() => setUser(data.user), [data]);
    const loginRef = useRef<LoginActionRef>(null);

    useEffect(() => {
        notifications.asObservable().subscribe((no: Notification[]) => {
            setMessages(no.map((n) => ({
                id: n.id,
                type: n.type,
                content: n.message,
                loading: n.loading || false,
                dismissible: true,
                onDismiss: () => {
                    notifications.removeMessage(n);
                },
            })));
        });
    }, []);

    return (
        <React.Fragment>
            <LoginAction ref={loginRef} onLoggedIn={() => window.location.reload()}/>
            <div id="h" style={{position: 'sticky', top: 0, zIndex: 1002}}>
                <TopNavigation identity={{
                    title: 'Community RCon',
                    href: '/',
                    onFollow: (e: CustomEvent) => {
                        e.detail['href'] = '/';
                        routerFollower(e);
                    },
                }} utilities={user?.isAuthenticated ? [{
                    type: 'menu-dropdown',
                    text: 'Logged In',
                    description: user.canChangeServerSettings ? 'Server Admin' : 'Moderator',
                    iconName: 'user-profile',
                    onItemClick: (e) => {
                        if (e.detail.id === 'signout') {
                            notifications.connectTo(userinfoService.logOut()).subscribe({
                                next: () => window.location.reload(),
                                error: (e) => notifications.error('Could not log you out. Please try again. Error: ' + e.toString()),
                            });
                        }
                    },
                    items: [
                        {id: 'signout', text: 'Sign out'}
                    ]
                }] : [{
                    type: 'button',
                    text: 'Login',
                    onClick: () => loginRef.current?.show(),
                }]} i18nStrings={{
                    overflowMenuBackIconAriaLabel: '',
                    overflowMenuDismissIconAriaLabel: '',
                    overflowMenuTriggerText: '',
                    searchDismissIconAriaLabel: '',
                    searchIconAriaLabel: '',
                    overflowMenuTitleText: '',
                }}
                ></TopNavigation>
            </div>
            <AppLayout
                contentType="dashboard"
                headerSelector="#h"
                toolsHide={true}
                notifications={<Flashbar items={messages}/>}
                navigation={<SideNavigation
                    items={[{
                        type: 'section',
                        text: 'Players',
                        items: [{
                            type: 'link',
                            text: 'Live view',
                            href: '/liveview',
                        }, {
                            type: 'link',
                            text: 'Game view',
                            href: '/gameview',
                        }]
                    }, {
                        type: 'divider',
                    }, {
                        type: 'link',
                        text: 'Documentation',
                        external: true,
                        href: 'https://github.com/MarechJ/hll_rcon_tool/wiki',
                    }]}
                    activeHref={location.pathname}
                    onFollow={routerFollower}/>}
                breadcrumbs={<BreadcrumbGroup items={[]}/>}
                content={<Outlet/>}
            />
        </React.Fragment>
    );
}

export default App;
