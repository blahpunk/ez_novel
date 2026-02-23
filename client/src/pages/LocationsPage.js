import React from 'react';
import LocationsTab from '../components/tabs/LocationsTab';
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

function LocationsPage() {
  return (
    <PageShell>
      <Hero>
        <h2>Location Atlas</h2>
        <p>Capture setting details, sensory notes, and continuity anchors for every place.</p>
      </Hero>
      <ContentCard>
        <LocationsTab />
      </ContentCard>
    </PageShell>
  );
}

export default LocationsPage;
