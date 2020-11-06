
import SearchResults from '../components/search/SearchResults';
import { uiShowSearch } from 'src/components/utils/env';
import { PageNotFound } from 'src/components/utils';

export default uiShowSearch ? SearchResults : PageNotFound
