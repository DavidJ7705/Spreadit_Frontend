import classes from './Card.module.css';

function Card(props) {
  const combined = `${classes.card} ${props.className || ''}`;
  return <div className={combined}>{props.children}</div>;
}

export default Card;
