// React компонент LoaderThree
// Использует только React - без TypeScript, без сборщика

const LoaderThree = ({ className = "" }) => {
  return (
    <div className={`loader-three-react-container ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="loader-three-react-svg"
      >
        {/* Верхний треугольник */}
        <path
          d="M20 5L30 20H10L20 5Z"
          fill="#FFA500"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Нижний треугольник */}
        <path
          d="M20 35L10 20H30L20 35Z"
          fill="#FFA500"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

// Экспорт для использования
if (typeof window !== 'undefined') {
  window.LoaderThree = LoaderThree;
}
