
import SearchResults from '../components/search/SearchResults';
import { uiShowSearch } from 'src/components/utils/env';
import { ErrorPage } from 'src/components/utils';

export default uiShowSearch ? SearchResults : ErrorPage
