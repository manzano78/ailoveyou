// src/components/ThoughtButton.tsx

import './tought-button.css';

// Définition des types pour les props du composant
interface ThoughtButtonProps {
  children: React.ReactNode; // 'children' peut être du texte, un autre composant, etc.
  onClick?: React.MouseEventHandler<HTMLButtonElement>; // 'onClick' est une fonction optionnelle qui gère les clics
}

// On utilise React.FC (Functional Component) et on lui passe notre interface de props
const ThoughtButton: React.FC<ThoughtButtonProps> = ({ children, onClick }) => {
  return (
    <button className="thought-button w-full" onClick={onClick}>
      <span className="thought-button-text">{children}</span>
    </button>
  );
};

export default ThoughtButton;
