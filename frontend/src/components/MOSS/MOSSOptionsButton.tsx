import React from 'react';

// Option button configuration interface
export interface OptionButton {
  id: string;
  icon: string;
  title: string;
  onClick: () => void;
}

interface OptionsButtonProps {
  options: OptionButton[];
  showOptions: boolean;
  isAnimating: boolean;
  optionRefs: React.MutableRefObject<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>;
  calculateOptionPositions: () => (OptionButton & {
    ref: React.RefObject<HTMLButtonElement | null>;
    style: React.CSSProperties;
  })[];
}

/**
 * Component for rendering option buttons in a circular arc
 */
const OptionsButton: React.FC<OptionsButtonProps> = ({ 
  options, 
  showOptions, 
  isAnimating, 
  optionRefs,
  calculateOptionPositions 
}) => {
  // Initialize refs for option buttons
  const initializeOptionRefs = () => {
    options.forEach(button => {
      if (!optionRefs.current[button.id]) {
        optionRefs.current[button.id] = React.createRef<HTMLButtonElement>();
      }
    });
  };

  // Initialize refs when options change
  React.useEffect(() => {
    initializeOptionRefs();
  }, [options]);

  if (!showOptions) return null;

  return (
    <>
      {calculateOptionPositions().map((option) => (
        <button 
          key={option.id}
          ref={option.ref}
          onClick={option.onClick}
          className={`fixed z-40 w-12 h-12 rounded-full bg-gray-800/80 hover:bg-gray-700/80 shadow-lg flex items-center justify-center transition-all duration-200 ease-out ${
            isAnimating 
              ? 'animate-bounce scale-0 opacity-0' 
              : 'scale-100 opacity-100'
          }`}
          style={option.style}
          title={option.title}
        >
          <span className="text-xl">{option.icon}</span>
        </button>
      ))}
    </>
  );
};

export default OptionsButton;