// client/src/pages/ChaptersPage.js
import React, { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import ChaptersManager from '../components/ChaptersManager';
import ExportPanel from '../components/ExportPanel';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;  
  background-color: #1e1e1e;
  padding: 20px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 10px;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #2e2e2e;
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box;
`;

const ManagerContainer = styled.div`
  width: 300px;
  background-color: #222;
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    z-index: 10;
    transform: ${(props) => (props.visible ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform 0.3s ease;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  }
`;

const ToggleButton = styled.button`
  background: #00ff99;
  color: #121212;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: none;

  @media (max-width: 768px) {
    display: block;
    align-self: flex-end;
  }
`;

const ExportContainer = styled.div`
  margin-top: 20px;
`;

function ChaptersPage() {
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    // Auto-hide sidebar on small screens initially
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  }, []);

  return (
    <PageContainer>
      <Title>Manage Chapters</Title>
      <ToggleButton onClick={() => setShowSidebar((prev) => !prev)}>
        {showSidebar ? 'Hide Chapters' : 'Show Chapters'}
      </ToggleButton>
      <ContentArea>
        <EditorContainer>
          <Editor />
        </EditorContainer>
        <ManagerContainer visible={showSidebar}>
          <ChaptersManager />
        </ManagerContainer>
      </ContentArea>
      <ExportContainer>
        <ExportPanel />
      </ExportContainer>
    </PageContainer>
  );
}

export default ChaptersPage;
