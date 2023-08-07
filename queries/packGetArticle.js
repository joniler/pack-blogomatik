import { packClient } from '../clients/packClient.js';
import gql from "graphql-tag";

const query = gql`
  query ($handle: String!){
    articleByHandle(handle: $handle) {
      handle
    }
  }
`;

export const packGetArticle = async (articleHandle) => {
  const client = packClient(process.env.PACK_STOREFRONT_SECRET);

  const result = await client.query({
    query: query,
    variables: {
      handle: articleHandle
    }
  });

  return result;
}