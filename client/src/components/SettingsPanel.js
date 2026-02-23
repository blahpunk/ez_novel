import React, { useState } from 'react';
import styled from 'styled-components';
import BookSelector from './BookSelector';
import ChaptersManager from './ChaptersManager';
import ExportPanel from './ExportPanel';
import CharactersTab from './tabs/CharactersTab';
import LocationsTab from './tabs/LocationsTab';
import PlotTab from './tabs/PlotTab';

const PanelContainer = styled.div`
  width: 300px;
  background-color: #1a1a1a;
  border-right: 2px solid #333;
  padding: 10px;
  overflow-y: auto;
  /* Prevent horizontal scrolling */
  overflow-x: hidden;
`;

const TabHeader = styled.div`
  display: flex;
  margin-top: 10px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px;
  background: ${(props) => (props.active ? '#333' : '#1a1a1a')};
  color: #e0e0e0;
  border: none;
  border-bottom: ${(props) => (props.active ? '2px solid #00ff99' : 'none')};
  cursor: pointer;
  &:hover {
    background: #2a2a2a;
  }
`;

function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('characters');

  const renderTab = () => {
    switch (activeTab) {
      case 'characters':
        return <CharactersTab />;
      case 'locations':
        return <LocationsTab />;
      case 'plot':
        return <PlotTab />;
      default:
        return <CharactersTab />;
    }
  };

  return (
    <PanelContainer>
      {/* BookSelector is now integrated into the side menu */}
      <BookSelector />
      <ChaptersManager />
      <ExportPanel />
      <TabHeader>
        <TabButton active={activeTab === 'characters'} onClick={() => setActiveTab('characters')}>
          Characters
        </TabButton>
        <TabButton active={activeTab === 'locations'} onClick={() => setActiveTab('locations')}>
          Locations
        </TabButton>
        <TabButton active={activeTab === 'plot'} onClick={() => setActiveTab('plot')}>
          Plot Points
        </TabButton>
      </TabHeader>
      {renderTab()}
    </PanelContainer>
  );
}

export default SettingsPanel;
