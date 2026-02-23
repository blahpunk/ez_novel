import styled from 'styled-components';

export const AppContainer = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
`;

export const HeaderBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #111;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
`;

export const LogoutButton = styled.button`
  padding: 6px 12px;
  background: #ff4d4f;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #e33;
  }
`;
