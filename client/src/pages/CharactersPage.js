import React from 'react';
import CharactersTab from '../components/tabs/CharactersTab';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #1e1e1e;
  flex: 1;
  overflow-y: auto;
`;

function CharactersPage() {
  return (
    <PageContainer>
      <h2 style={{ color: '#fff' }}>Manage Characters</h2>
      <CharactersTab />
    </PageContainer>
  );
}

export default CharactersPage;
