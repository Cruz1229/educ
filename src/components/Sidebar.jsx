import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { GiVrHeadset, GiPlatform } from 'react-icons/gi';
import { FaHome, FaReact, FaDownload, FaEye } from 'react-icons/fa';
import { IoCreateOutline } from 'react-icons/io5';
import { LuSquareActivity } from 'react-icons/lu';
import { SiUbisoft } from 'react-icons/si';
import { MdOutlineViewInAr, MdOutlineSmartToy } from 'react-icons/md';

const STEP_MAP = {
  'ar':          'tipoContenido',
  'ar-summary':  'tecnologiaRA',
  'preview':     'vistaPrevia',
  'game':        'vistaPrevia',
  'setup':       'vistaPrevia',
};

const Sidebar = () => {
  const location = useLocation();

  const navState      = location.state || {};
  const withRA        = navState.withRA === true;
  const gameSetupStep = navState.setupStep ?? null;
  const currentStep   = gameSetupStep ? (STEP_MAP[gameSetupStep] ?? null) : null;

  const isSummaryView = location.search.includes('view=Summary');
  const isInSettings  = location.pathname === '/settings' && !isSummaryView;

  // Cuando hay submenú desplegado, el padre no debe mostrar el estilo "active" completo
  const parentIsOpen  = isInSettings && withRA;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title"><GiVrHeadset /> STEAM-G</div>
      </div>

      <nav>
        <ul className="menu">

          <li>
            <NavLink to="/WelcomeScreen"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : 'disabled'}`}>
              <FaHome /> Inicio
            </NavLink>
          </li>

          <li>
            <NavLink to="/areas"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : 'disabled'}`}>
              <FaReact /> Áreas STEAM
            </NavLink>
          </li>

          <li>
            <NavLink to="/skills"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : 'disabled'}`}>
              <IoCreateOutline /> Habilidades STEAM
            </NavLink>
          </li>

          <li>
            <NavLink to="/activities"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : 'disabled'}`}>
              <LuSquareActivity /> Actividades STEAM
            </NavLink>
          </li>

          <li>
            <NavLink to="/platform"
              className={({ isActive }) => `menu-item ${isActive ? 'active' : 'disabled'}`}>
              <GiPlatform /> Plataforma
            </NavLink>
          </li>

          {/* ── Configuración App + submenú RA ── */}
          <li>
            {/* 
              Si el submenú está abierto → padre con estilo "parent-open" (no compite con el hijo activo)
              Si no → comportamiento normal active/disabled
            */}
            <NavLink
              to="/settings"
              end
              className={({ isActive }) => {
                if (parentIsOpen) return 'menu-item parent-open';
                return `menu-item ${isActive && !isSummaryView ? 'active' : 'disabled'}`;
              }}
            >
              <SiUbisoft /> Configuración App
            </NavLink>

            {parentIsOpen && (
              <ul style={submenuContainerStyle}>
                <li>
                  <span style={{
                    ...submenuItemStyle,
                    ...(currentStep === 'tipoContenido' ? submenuActiveStyle : submenuInactiveStyle)
                  }}>
                    <MdOutlineSmartToy style={{ flexShrink: 0 }} />
                    Tipo de Contenido
                  </span>
                </li>
                <li>
                  <span style={{
                    ...submenuItemStyle,
                    ...(currentStep === 'tecnologiaRA' ? submenuActiveStyle : submenuInactiveStyle)
                  }}>
                    <MdOutlineViewInAr style={{ flexShrink: 0 }} />
                    Tecnología RA
                  </span>
                </li>
                <li>
                  <span style={{
                    ...submenuItemStyle,
                    ...(currentStep === 'vistaPrevia' ? submenuActiveStyle : submenuInactiveStyle)
                  }}>
                    <FaEye style={{ flexShrink: 0 }} />
                    Vista Previa
                  </span>
                </li>
              </ul>
            )}
          </li>

          {/* ── Resumen y Descarga ── */}
          <li>
            <NavLink
              to="/settings?view=Summary"
              className={() => {
                const active = location.pathname === '/settings' && location.search === '?view=Summary';
                return `menu-item ${active ? 'active' : 'disabled'}`;
              }}
            >
              <FaDownload /> Resumen y Descarga
            </NavLink>
          </li>

        </ul>
      </nav>

      {/* Estilos scoped para el submenú */}
      <style>{`
        /* Padre con submenú abierto: borde izquierdo sutil, sin el fondo brillante del active */
        .menu-item.parent-open {
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border-left: 3px solid rgba(255, 255, 255, 0.4) !important;
          color: rgba(255, 255, 255, 0.85) !important;
          cursor: default;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

/* ── Estilos del submenú como objetos JS ── */

const submenuContainerStyle = {
  listStyle: 'none',
  padding: '4px 0 6px 0',
  margin: '0',
  marginLeft: '0.8rem',
  borderLeft: '2px solid rgba(255,255,255,0.2)',
  paddingLeft: '0',
};

const submenuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 12px 7px 14px',
  fontSize: '0.82rem',
  fontWeight: 500,
  borderRadius: '0 6px 6px 0',
  margin: '2px 6px 2px 0',
  cursor: 'default',
  transition: 'all 0.2s ease',
  userSelect: 'none',
};

const submenuActiveStyle = {
  background: 'rgba(255, 255, 255, 0.18)',
  color: '#ffffff',
  borderLeft: '3px solid #ffffff',
  paddingLeft: '11px',   // compensa el borde
  opacity: 1,
};

const submenuInactiveStyle = {
  background: 'transparent',
  color: 'rgba(255, 255, 255, 0.4)',
  borderLeft: '3px solid transparent',
  paddingLeft: '11px',
  opacity: 1,
};

export default Sidebar;