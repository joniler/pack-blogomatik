import gql from "graphql-tag";
import { shopifyClient } from "../clients/shopifyClient.js";

const query = gql`
  query ($handle: String!) {
    blogByHandle(handle: $handle) {
      id
      handle
      title
      seo {
        description
        title
      }
    }
  }
`;

export const shopifyGetBlog = async (handle) => {
  const client = shopifyClient(process.env.SHOPIFY_STORE_URL, process.env.SHOPIFY_STOREFRONT_API_KEY);

  const result = await client.query({
    query,
    variables: {
      handle: handle,
    },
  });

  return result.data.blogByHandle;
}