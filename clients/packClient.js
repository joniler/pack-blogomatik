import pkg from "apollo-client";
const { ApolloClient } = pkg;
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

export const packClient = (packStorefrontSecret) => {
  return new ApolloClient({
    link: createHttpLink({
      uri: "https://app.packdigital.com/graphql",
      headers: {
        "Authorization": `Bearer ${packStorefrontSecret}`,
      },
    }),
    cache: new InMemoryCache(),
  });
};