// client/src/pages/ChaptersPage.js
import React from 'react';
import Editor from '../components/Editor';
import ChaptersManager from '../components/ChaptersManager';
import ExportPanel from '../components/ExportPanel';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* Fill the entire browser viewport */
  height: 100vh;  
  background-color: #1e1e1e;
  padding: 20px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;              /* Occupies the remaining vertical space below the title */
  gap: 20px;
  max-width: 1200px;    /* Limit the content width if desired */
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`;

const EditorContainer = styled.div`
  flex: 1;              /* Editor fills available horizontal space */
  display: flex;        /* Allows further flex children inside (e.g. the Editor) */
  flex-direction: column;
  background-color: #2e2e2e;
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box;
`;

const ManagerContainer = styled.div`
  width: 300px;         /* Fixed width for the chapters manager */
  background-color: #222;
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box;
`;

const ExportContainer = styled.div`
  margin-top: 20px;
`;

function ChaptersPage() {
  return (
    <PageContainer>
      <Title>Manage Chapters</Title>
      <ContentArea>
        <EditorContainer>
          <Editor />
        </EditorContainer>
        <ManagerContainer>
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
