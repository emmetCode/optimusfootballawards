import { Link } from 'react-router-dom';

// Renders a router link when `to` is given, otherwise a button.
export default function Button({ to, variant = 'primary', className = '', children, ...rest }) {
  const classes = `btn btn--${variant} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
