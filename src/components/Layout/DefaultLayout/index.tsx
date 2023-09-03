import Header from './Header';
import Sidebar from './Sidebar';

function DefaultLayout({ children }: { children: JSX.Element }) {
    return (
        <div>
            <Header />
            <div className="container">
                <Sidebar />
                <div className="content">{children}</div>
            </div>
        </div>
    );
}

export default DefaultLayout;
