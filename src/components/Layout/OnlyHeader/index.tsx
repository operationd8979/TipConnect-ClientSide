import { Header } from '../components';

const OnlyHeader = ({ children }: { children: JSX.Element }) => {
    return (
        <div>
            <Header />
            <div className="container">
                <div className="content">{children}</div>
            </div>
        </div>
    );
};

export default OnlyHeader;
