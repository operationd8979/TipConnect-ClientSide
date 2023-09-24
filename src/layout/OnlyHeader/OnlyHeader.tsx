import { Header } from '../components';
import './OnlyHeader.moudle.scss';

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
