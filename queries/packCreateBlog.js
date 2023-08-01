import gql from "graphql-tag";
import { packClient } from "../clients/packClient.js";

const CREATE_BLOG = gql`
  mutation BlogCreate($input: BlogCreateInput!) {
    blogCreate(input: $input) {
      id
      title
      handle
      description
      status
      seo {
        title
        description
        image
        keywords
        noIndex
        noFollow
      }
    }
  }
`;

export const packCreateBlog = async (shopifyBlog) => {
  // Pack Expected Format
  // {
  //   title,
  //   handle,
  //   description,
  //   seo: {
  //     title,
  //     description,
  //     image,
  //     noIndex: !!noIndex,
  //     noFollow: !!noFollow,
  //   },
  //   sectionIds: [],
  // }

  const client = packClient(process.env.PACK_STOREFRONT_SECRET);

  const { title, handle, seo } = shopifyBlog
  const { description } = seo

  // Create new blog input
  const newBlogInput = {
    title,
    handle,
    description,
    seo: {
      title,
      description,
      image: null,
      noIndex: false,
      noFollow: false,
    },
    sectionIds: [],
  };

  const result = await client.mutate({
    mutation: CREATE_BLOG,
    variables: {
      input: newBlogInput,
    },
  })

  return result;
};