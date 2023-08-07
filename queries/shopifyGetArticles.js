import gql from "graphql-tag";
import { shopifyClient } from "../clients/shopifyClient.js";

const query = gql`
  query ArticlesByBlogHandle ($handle: String!, $first: Int, $after: String) {
    blogByHandle(handle: $handle){
      handle
      articles(first: $first, after: $after, reverse: true) {
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
            contentHtml
            seo {
              title
              description
            }
            blog {
              handle
            }
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

export const shopifyGetArticles = async (blogHandle, paginationCount, endCursor) => {
  const client = shopifyClient(process.env.SHOPIFY_STORE_URL, process.env.SHOPIFY_STOREFRONT_API_KEY);

  const result = await client.query({
    query,
    variables: {
      handle: blogHandle,
      first: paginationCount ? paginationCount : 250,
      after: endCursor ? endCursor : null,
    },
  });

  return result.data.blogByHandle.articles;
}