import gql from "graphql-tag";
import { shopifyClient } from "../clients/shopifyClient.js";

const query = gql`
  query ArticlesByBlogHandle ($handle: String!) {
    blogByHandle(handle: $handle){
      handle
      articles(first: 250) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            publishedAt
            tags
            excerpt
            excerptHtml
            contentHtml
            authorV2 {
              name
            }
            image {
              url
              altText
              height
              width
            }
          }
        }
      }
    }
  }
`;

export const shopifyGetArticles = async (blogHandle, paginationCount, startCursor, endCursor) => {
  const client = shopifyClient(process.env.SHOPIFY_STORE_URL, process.env.SHOPIFY_STOREFRONT_API_KEY);

  const result = await client.query({
    query,
    variables: {
      handle: blogHandle,
      first: paginationCount ? paginationCount : 250,
      after: startCursor ? startCursor : null,
      before: endCursor ? endCursor : null,
    },
  });

  return result.data.blogHandle.articles;
}