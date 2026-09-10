import { useLocation } from 'react-router-dom';

const ProgressBar = () => {
  const location = useLocation();
  
  // 1. Detectamos si existe un parámetro "?view=summary" en la URL actual
  const searchParams = new URLSearchParams(location.search);
 const isSummaryView = searchParams.get('view')?.toLowerCase() === 'summary';

  const routes = [
    { path: '/areas', name: 'Áreas', percentage: 16 },
    { path: '/skills', name: 'Habilidades', percentage: 33 },
    { path: '/activities', name: 'Actividades', percentage: 50 },
    { path: '/TecnologiaRa', name: 'Tecnologia de Realidad Aumentada', percentage: 55 },
    { path: '/TipoContenido', name: 'Tipo de Contenido', percentage: 60 },
    { path: '/Ra', name: 'Biblioteca de Tecnologías de Realidad Aumentada', percentage: 63 },
    { path: '/platform', name: 'Plataforma', percentage: 66 },
    { path: '/settings', name: 'Configuración', percentage: 85 },
  
  ];

  // 2. Buscamos la ruta base habitual
  let currentRoute = routes.find(route => location.pathname === route.path);

  // Si estamos en "/settings" Y el parámetro view es "summary", forzamos al 100%
if (currentRoute?.path === '/settings' && isSummaryView) {
    currentRoute = { ...currentRoute, name: 'Resumen', percentage: 100 };
}

  const progressPercentage = currentRoute ? currentRoute.percentage : 0;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="progress-info">
        {currentRoute ? (
          <>
            <span>{currentRoute.name}</span>
            <span className="progress-percentage">{progressPercentage}%</span>
          </>
        ) : (
          <span>Configuración inicial</span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;