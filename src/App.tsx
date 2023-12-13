import { Fragment } from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './routes/index';
import { DefaultLayout } from './layout';
import { useSelector } from 'react-redux';
import { State } from './type';
import { Call, Live, WatchLive } from './screens';

function App() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn } = currentUser;

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
                <Route path="/call/:relationShipID/:fullName/:type/:caller" element={<Call />} />
                <Route path="/live" element={<Live />} />
                <Route path="/watch/:liveID" element={<WatchLive />} />
            </Routes>
        </div>
    );
}

export default App;
