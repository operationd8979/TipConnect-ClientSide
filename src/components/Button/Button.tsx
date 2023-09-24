import { Link } from 'react-router-dom';
import styles from './Button.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

interface ButtonInterface {
    to?: string;
    href?: string;
    primary?: boolean;
    outline?: boolean;
    disabled?: boolean;
    small?: boolean;
    large?: boolean;
    children?: React.ReactNode;
    onClick?: (() => void) | null;
}

const Button = ({
    to = '',
    href = '',
    primary = false,
    outline = false,
    disabled = false,
    small = false,
    large = false,
    children = null,
    onClick = null,
    ...remainProps
}: ButtonInterface) => {
    const props: any = { onClick, ...remainProps };
    let Comp: any = 'button';
    const Classes = cx('wrapper', { primary, outline, disabled, small, large });
    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }
    if (disabled) {
        Object.keys(props).forEach((key) => {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                delete props[key];
            }
        });
    }
    return (
        <Comp className={Classes} {...props}>
            <span>{children}</span>
        </Comp>
    );
};

export default Button;
