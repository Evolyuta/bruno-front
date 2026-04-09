import styled from 'styled-components';

const StyledWrapper = styled.div.attrs((props) => ({
  style: {
    '--gradient-color': props.theme.requestTabs.bg,
    '--gradient-color-active': props.theme.bg
  }
}))`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-left: 4px;
  padding-right: 4px;

  .close-icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;
    border-radius: ${(props) => props.theme.border.radius.base};
    cursor: pointer;
    transition: background-color 0.12s ease;

    &:hover {
      background-color: ${(props) => props.theme.requestTabs.icon.hoverBg};

      .close-icon {
        color: ${(props) => props.theme.requestTabs.icon.hoverColor};
      }
    }
  }

  .close-icon {
    color: ${(props) => props.theme.requestTabs.icon.color};
    width: 12px;
    height: 12px;
    transition: color 0.12s ease;
  }

  .has-changes-icon {
    width: 8px;
    height: 8px;
  }

  .draft-icon-wrapper { 
    display: none; 
  }
  
  .close-icon-wrapper { 
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.has-changes:not(li:hover &) {
    .draft-icon-wrapper { 
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-icon-wrapper { 
      display: none; 
    }
  }

  li:hover &.has-changes {
    .draft-icon-wrapper { 
      display: none; 
    }
    .close-icon-wrapper { 
      display: flex; 
    }
  }
`;

export default StyledWrapper;
