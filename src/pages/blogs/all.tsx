import { ListBlogPage } from '../../components/blogs/ListBlogs';
import { api as webApi } from '@polkadot/ui-api';
import Api from '../../components/utils/serverConnect';
import { BlogId } from '../../components/types';

ListBlogPage.getInitialProps = async (props): Promise<any> => {
  const api = props.req ? await Api.setup() : webApi;
  const nextId = await api.query.blogs.nextBlogId() as BlogId;
  return {
    nextBlogId: nextId
  };
};

export default ListBlogPage;
