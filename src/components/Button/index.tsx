import { Link } from 'react-router-dom';
import styles from './Buttom.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

interface ButtonInterface {
    to: string;
    href: string;
    primary: boolean;
    outline: boolean;
    small: boolean;
    large: boolean;
    children: any;
    onClick: any;
}

const Button = ({
    to = '',
    href = '',
    primary = false,
    outline = false,
    small = false,
    large = false,
    children = null,
    onClick = null,
    ...remainProps
}: ButtonInterface) => {
    const props: any = { onClick, ...remainProps };
    let Comp: any = 'button';
    const Classes = cx('wrapper');
    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }
    return (
        <Comp className={Classes} {...props}>
            <span>{children}</span>
        </Comp>
    );
};

export default Button;
