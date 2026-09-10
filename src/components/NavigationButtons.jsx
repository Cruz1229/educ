import { useNavigate } from 'react-router-dom';

const NavigationButtons = ({ 
  onBack, 
  onNext, 
  nextDisabled = false, 
  nextText = 'Continuar',
  backText = 'Anterior'
}) => {
  return (
    <div className="action-buttons">
      <button
        className="btn btn-outline"
        onClick={onBack}
      >
        {backText}
      </button>
      {onNext && (
        <button
          className="btn btn-primary"
          disabled={nextDisabled}
          onClick={onNext}
        >
          {nextText}
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;