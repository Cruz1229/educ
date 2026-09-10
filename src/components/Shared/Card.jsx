
const Card = ({ children, selected = false, onClick }) => {
  return (
    <div className={`card ${selected ? 'selected' : ''}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card; // Esta línea es crucial