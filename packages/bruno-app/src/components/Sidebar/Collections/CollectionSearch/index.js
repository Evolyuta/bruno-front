import { IconSearch, IconX } from '@tabler/icons';
import { useCustomFeature, CUSTOM_FEATURES } from 'utils/custom-features';
import StyledWrapper from './StyledWrapper';

const CollectionSearch = ({ searchText, setSearchText }) => {
  const preserveCase = useCustomFeature(CUSTOM_FEATURES.PRESERVE_SEARCH_CASE);

  return (
    <StyledWrapper>
      <IconSearch size={14} strokeWidth={1.5} className="search-icon" />
      <input
        type="text"
        name="search"
        placeholder="Search requests..."
        id="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        autoFocus
        spellCheck="false"
        value={searchText}
        onChange={(e) => setSearchText(preserveCase ? e.target.value : e.target.value.toLowerCase())}
      />
      {searchText !== '' && (
        <div className="clear-icon" onClick={() => setSearchText('')}>
          <IconX size={14} strokeWidth={1.5} />
        </div>
      )}
    </StyledWrapper>
  );
};

export default CollectionSearch;
