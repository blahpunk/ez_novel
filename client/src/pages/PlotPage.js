import React from 'react';
import PlotTab from '../components/tabs/PlotTab';
import styled from 'styled-components';

const PageShell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeInUp 300ms ease both;
`;

const Hero = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(7, 13, 24, 0.7);
  box-shadow: var(--shadow-soft);
  padding: 16px;

  h2 {
    margin: 0;
    color: #f8fbff;
    font-family: var(--font-display);
  }

  p {
    margin: 5px 0 0;
    color: var(--text-muted);
  }
`;

const ContentCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(7, 13, 24, 0.7);
  box-shadow: var(--shadow-soft);
  padding: 14px;
`;

function PlotPage() {
  return (
    <PageShell>
      <Hero>
        <h2>Plot Architecture</h2>
        <p>Build arcs, scene goals, and turning points while keeping story momentum visible.</p>
      </Hero>
      <ContentCard>
        <PlotTab />
      </ContentCard>
    </PageShell>
  );
}

export default PlotPage;
