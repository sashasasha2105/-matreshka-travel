// Demo компонент для LoaderThree
// Показывает LoaderThree с текстом

const LoaderThreeDemo = () => {
  return (
    <div className="loader-three-demo">
      <LoaderThree />
      <div className="loader-three-demo-text">Загрузка...</div>
    </div>
  );
};

// Экспорт для использования
if (typeof window !== 'undefined') {
  window.LoaderThreeDemo = LoaderThreeDemo;
}
