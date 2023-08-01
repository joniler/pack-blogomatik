import { packClient } from '../clients/packClient.js';
import gql from "graphql-tag";

const query = gql`
  {
    blogs(first: 25) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export const packGetBlogs = async () => {
  const client = packClient(process.env.PACK_STOREFRONT_SECRET);

  const result = await client.query({
    query: query
  });

  return result.data.blogs.edges.map(({ node }) => node.handle);
}