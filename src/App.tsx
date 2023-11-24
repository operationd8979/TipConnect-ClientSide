import { Fragment } from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './routes/index';
import { DefaultLayout } from './layout';
import { useSelector } from 'react-redux';
import { State } from './type';
import { Call, Listen } from './screens';

function App() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;

    return (
        <div className="App" id="App">
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Page = route.component;
                    const PayLoad = route.layout ? (isLoggedIn ? route.layout : Fragment) : Fragment;
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                <DefaultLayout>
                                    <PayLoad>
                                        <Page />
                                    </PayLoad>
                                </DefaultLayout>
                            }
                        />
                    );
                })}
                <Route path="/call/:friendId/:fullName/:type" element={<Call />} />
                <Route path="/listen/:friendId/:fullName/:type" element={<Listen />} />
            </Routes>
        </div>
    );
}

export default App;
