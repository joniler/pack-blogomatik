import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";

export const packClient = (packStorefrontSecret) => {

  const httpLink = createHttpLink({
    uri: "https://app.packdigital.com/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: Object.assign(headers || {}, {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.PACK_STOREFRONT_SECRET ? process.env.PACK_STOREFRONT_SECRET : packStorefrontSecret}`,
      }),
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
      },
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
      },
    },
  });

};