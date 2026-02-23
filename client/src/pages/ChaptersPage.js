import React, { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import ChaptersManager from '../components/ChaptersManager';
import ExportPanel from '../components/ExportPanel';
import styled from 'styled-components';

const PageShell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeInUp 300ms ease both;
`;

const Hero = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(7, 13, 24, 0.68);
  box-shadow: var(--shadow-soft);
  padding: 14px;

  h2 {
    margin: 0;
    color: #f8fbff;
    font-family: var(--font-display);
    font-size: clamp(1.15rem, 2.1vw, 1.45rem);
  }

  p {
    margin: 4px 0 0;
    color: var(--text-muted);
    font-size: 0.86rem;
  }
`;

const ToggleButton = styled.button`
  padding: 9px 12px;
  font-size: 0.82rem;
`;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 330px) minmax(0, 1fr);
  gap: 14px;
  min-height: min(76dvh, 920px);

  @media (max-width: 1020px) {
    grid-template-columns: minmax(0, 1fr);
    min-height: auto;
  }
`;

const SidebarBackdrop = styled.div`
  display: none;

  @media (max-width: 1020px) {
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(2, 7, 14, 0.56);
    z-index: 70;
  }
`;

const Sidebar = styled.aside`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(6, 11, 20, 0.75);
  box-shadow: var(--shadow-soft);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 1020px) {
    position: fixed;
    top: 12px;
    right: 12px;
    bottom: 12px;
    width: min(92vw, 420px);
    transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(105%)')};
    transition: transform 220ms ease;
    z-index: 80;
    overflow-y: auto;
  }
`;

const EditorPane = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(7, 13, 24, 0.68);
  box-shadow: var(--shadow-soft);
  padding: 12px;
  min-height: 0;
`;

function ChaptersPage() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1020);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth > 1020);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 1020;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <PageShell>
      <Hero>
        <div>
          <h2>Chapter Workspace</h2>
          <p>Draft, revise, and structure chapters with a dedicated writing layout.</p>
        </div>
        <ToggleButton onClick={() => setShowSidebar((visible) => !visible)}>
          {showSidebar ? 'Hide chapter map' : 'Show chapter map'}
        </ToggleButton>
      </Hero>

      <Workspace>
        {isMobile && <SidebarBackdrop open={showSidebar ? 1 : 0} onClick={() => setShowSidebar(false)} />}

        <Sidebar open={showSidebar ? 1 : 0}>
          <ChaptersManager onChapterPicked={() => isMobile && setShowSidebar(false)} />
          <ExportPanel compact />
        </Sidebar>

        <EditorPane>
          <Editor />
        </EditorPane>
      </Workspace>
    </PageShell>
  );
}

export default ChaptersPage;
