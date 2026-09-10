import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { steamAreas, skillGroups, skillToAreaMap } from '../data/steamData';
import { IoArrowBackSharp } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/theme.css';
import '../styles/screens.css';

const SteamSkills = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const { state } = useLocation();
  const navigate = useNavigate();
  const [skillsByArea, setSkillsByArea] = useState([]);
  const [validationError, setValidationError] = useState(false);

  // --- NUEVO: Forzar scroll al inicio al cargar el componente ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (state?.selectedAreas) {
      const areasWithSkills = state.selectedAreas.map(areaId => ({
        id: areaId,
        name: steamAreas[areaId].name,
        skills: steamAreas[areaId].skills,
        icon: steamAreas[areaId].icon
      }));
      setSkillsByArea(areasWithSkills);
    }
  }, [state]);

  // Obtiene los IDs de las áreas actualmente visibles
  const getCurrentAreaIds = (currentSkillsByArea) => {
    return currentSkillsByArea.map(area => area.id);
  };

  // Encuentra el área de una habilidad
  const findAreaIdBySkill = (skillName) => {
    return skillToAreaMap[skillName] || null;
  };

  // Encuentra todos los grupos relevantes para una habilidad
  const findAllRelevantGroups = (skill, currentAreaIds) => {
    const relevantGroups = [];
    
    for (const group of skillGroups) {
      if (group.skills.includes(skill)) {
        const selectedRequiredAreas = group.requiredAreas.filter(areaId => 
          currentAreaIds.includes(areaId)
        );
        
        if (selectedRequiredAreas.length > 0) {
          relevantGroups.push({
            ...group,
            selectedRequiredAreas,
            allAreasSelected: selectedRequiredAreas.length === group.requiredAreas.length
          });
        }
      }
    }
    
    return relevantGroups.sort((a, b) => {
      if (a.allAreasSelected !== b.allAreasSelected) {
        return b.allAreasSelected ? 1 : -1;
      }
      return b.selectedRequiredAreas.length - a.selectedRequiredAreas.length;
    });
  };

  const toggleSkill = (skill) => {
    const currentAreaIds = getCurrentAreaIds(skillsByArea);
    const isDeselecting = selectedSkills.includes(skill);
    
    // --- LÓGICA MODIFICADA: APLICAR SIEMPRE LA BIDIRECCIONALIDAD ---
    
    const relevantGroups = findAllRelevantGroups(skill, currentAreaIds);
    let newSelectedSkills;

    if (isDeselecting) {
      // DESELECCIÓN: Quitamos la habilidad y sus vinculadas VISIBLES
      const skillsToRemove = new Set([skill]);
      
      relevantGroups.forEach(group => {
        group.skills.forEach(groupSkill => {
          const sArea = findAreaIdBySkill(groupSkill);
          // Solo marcamos para borrar si pertenece a un área que el usuario está viendo
          if (sArea && currentAreaIds.includes(sArea)) {
            skillsToRemove.add(groupSkill);
          }
        });
      });
      
      newSelectedSkills = selectedSkills.filter(s => !skillsToRemove.has(s));
      
    } else {
      // SELECCIÓN: Agregamos la habilidad y sus vinculadas VISIBLES
      const skillsToAdd = new Set([skill]);
      
      if (relevantGroups.length > 0) {
        // Obtenemos el grupo más relevante (puede ser interno del área o mixto)
        const primaryGroup = relevantGroups[0];
        
        primaryGroup.skills.forEach(groupSkill => {
          const skillArea = findAreaIdBySkill(groupSkill);
          
          // IMPORTANTE: Solo agregamos la habilidad vinculada SI su área YA está en pantalla.
          if (skillArea && currentAreaIds.includes(skillArea)) {
            skillsToAdd.add(groupSkill);
          }
        });
      }
      
      newSelectedSkills = [...new Set([...selectedSkills, ...skillsToAdd])];
    }

    setSelectedSkills(newSelectedSkills);
    if (validationError) setValidationError(false);
  };

  const handleContinue = () => {
    if (selectedSkills.length === 0) {
      setValidationError(true);
      return;
    }
    
    navigate('/activities', { 
      state: { 
        selectedAreas: skillsByArea.map(a => a.id),
        selectedSkills
      }
    });
  };

  return (
    <div className="screen-container">
      {/* Estilos CSS para la barra de desplazamiento estética */}
      <style>{`
        .horizontal-skills-container::-webkit-scrollbar {
          height: 12px; /* Altura de la barra horizontal */
        }
        .horizontal-skills-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .horizontal-skills-container::-webkit-scrollbar-thumb {
          background: #888; 
          border-radius: 10px;
          border: 3px solid #f1f1f1; /* Espacio alrededor del thumb */
        }
        .horizontal-skills-container::-webkit-scrollbar-thumb:hover {
          background: #555; 
        }
      `}</style>

      <div className="selection-container">
        <h2 className="selection-title">Habilidades STEAM</h2>
        <p className="selection-instruction">
          Selecciona al menos una habilidad que deseas fortalecer
        </p>
        
        {validationError && (
          <div className="validation-error">
            ¡Debes seleccionar al menos una habilidad para continuar!
          </div>
        )}
        
        <div 
          className="horizontal-skills-container"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',    // Mantiene todo en una sola fila
            overflowX: 'auto',     // Permite el scroll horizontal
            justifyContent: 'flex-start', // Alinea al inicio para permitir scroll correcto
            gap: '20px',
            alignItems: 'stretch',
            paddingBottom: '20px', // Espacio para la barra de scroll
            width: '100%',         // Ocupa todo el ancho disponible
            paddingLeft: '10px',   // Padding visual
            paddingRight: '10px'
          }}
        >
          {skillsByArea.map((area) => (
            <div 
              key={area.id} 
              className="area-skills-group"
              style={{
                flex: '0 0 350px', // Ancho fijo, no se encoge (0 shrink)
                width: '350px',
                maxWidth: '85vw',  // Para móviles, que no sea más ancho que la pantalla
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="area-header">
                 <Player
                    src={area.icon} 
                    className="player"
                    alt={`Icono ${area.name}`}
                    loop
                    autoplay
                    style={{ height: '100px', width: '100px' }}
                  />
                <h3 className="area-title">{area.name}</h3>
              </div>
              
              <div className="skills-list" style={{ flex: 1 }}>
                {area.skills.map(skill => (
                  <div
                    key={`${area.id}-${skill}`}
                    className={`skill-item ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="action-buttons">
          <button
             className="no-rounded-button"
            onClick={() => navigate(-1)}
          ><IoArrowBackSharp />
            Anterior
          </button>
          
          <button
            className="no-rounded-button"
            disabled={selectedSkills.length === 0}
            onClick={handleContinue}
            style={{
              opacity: selectedSkills.length === 0 ? 0.5 : 1,
              cursor: selectedSkills.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Ver Actividades <GrLinkNext />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SteamSkills;