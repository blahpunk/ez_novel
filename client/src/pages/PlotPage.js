import React from 'react';
import PlotTab from '../components/tabs/PlotTab';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #1e1e1e;
  flex: 1;
  overflow-y: auto;
`;

function PlotPage() {
  return (
    <PageContainer>
      <h2>Manage Plot Points</h2>
      <PlotTab />
    </PageContainer>
  );
}

export default PlotPage;
