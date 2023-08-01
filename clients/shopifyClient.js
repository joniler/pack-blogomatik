import pkg from "apollo-client";
const { ApolloClient } = pkg;
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

export const shopifyClient = (shopifyEndpoint, storefrontApiKey) => {
  return new ApolloClient({
    link: createHttpLink({
      uri: `https://${shopifyEndpoint}/api/2023-07/graphql.json`,
      headers: {
        "X-Shopify-Storefront-Access-Token": storefrontApiKey,
      },
    }),
    cache: new InMemoryCache(),
  });
}