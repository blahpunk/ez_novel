// src/components/ResponsivePageLayout.js
import React, { useState } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
`;

const TopBar = styled.div`
  padding: 10px 20px;
  background: #111;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: ${(props) => (props.show ? '300px' : '0')};
  transition: width 0.3s ease;
  overflow-x: hidden;
  background-color: #222;
  padding: ${(props) => (props.show ? '20px' : '0')};
  box-sizing: border-box;
`;

const Main = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ToggleButton = styled.button`
  background: #00ff99;
  color: #121212;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  @media (min-width: 768px) {
    display: none;
  }
`;

export default function ResponsivePageLayout({ title, sidebar, children }) {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  return (
    <PageContainer>
      <TopBar>
        <div>{title}</div>
        <ToggleButton onClick={() => setShowSidebar((s) => !s)}>
          {showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
        </ToggleButton>
      </TopBar>
      <ContentArea>
        <Sidebar show={showSidebar}>{sidebar}</Sidebar>
        <Main>{children}</Main>
      </ContentArea>
    </PageContainer>
  );
}
