import { Fragment } from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './routes/index';
import { DefaultLayout, OnlyHeader } from './layout';
import { useSelector } from 'react-redux';
import { State } from './type';

function App() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;

    return (
        <div className="App">
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Layout =
                        route.layout || (route.layout === null ? Fragment : isLoggedIn ? DefaultLayout : OnlyHeader);
                    const Page = route.component;
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                <Layout>
                                    <Page />
                                </Layout>
                            }
                        />
                    );
                })}
            </Routes>
        </div>
    );
}

export default App;
