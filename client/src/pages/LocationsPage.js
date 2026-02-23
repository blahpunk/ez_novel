import React from 'react';
import LocationsTab from '../components/tabs/LocationsTab';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #1e1e1e;
  flex: 1;
  overflow-y: auto;
`;

function LocationsPage() {
  return (
    <PageContainer>
      <h2>Manage Locations</h2>
      <LocationsTab />
    </PageContainer>
  );
}

export default LocationsPage;
