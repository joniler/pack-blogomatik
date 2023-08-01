import gql from "graphql-tag";
import { shopifyClient } from "../clients/shopifyClient.js";

const query = gql`
  {
    blogs(first: 250) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export const shopifyGetBlogs = async () => {
  const client = shopifyClient(process.env.SHOPIFY_STORE_URL, process.env.SHOPIFY_STOREFRONT_API_KEY);

  const result = await client.query({
    query: query
  });

  return result.data.blogs.edges.map(({ node }) => node.handle);
}