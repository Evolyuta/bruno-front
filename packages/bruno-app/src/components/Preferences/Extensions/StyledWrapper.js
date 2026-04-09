import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  .feature-item {
    border-radius: 0.5rem;
    border: 1px solid var(--color-gray-200);
    background-color: var(--color-gray-50);
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.75rem;
  }

  .feature-item:hover {
    background-color: var(--color-gray-100);
  }

  .feature-description {
    margin-top: 0.25rem;
  }
`;

export default StyledWrapper;
