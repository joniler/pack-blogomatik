import gql from "graphql-tag";
import { packClient } from "../clients/packClient.js";

const client = packClient(process.env.PACK_STOREFRONT_SECRET);

const CREATE_ARTICLE = gql`
  mutation ($input: ArticleCreateInput!) {
    articleCreate(input: $input) {
      title
      handle
      author
      description
      tags
      excerpt
      bodyHtml
      seo {
        image
        title
        description
        noIndex
        noFollow
      }
    }
  }
`;

export const packCreateArticle = async (packBlogId, shopifyArticle) => {

    // Expected Format
    // {
      // title,
      // handle,
      // description,
      // author,
      // tags,
      // excerpt,
      // bodyHtml,
      // blog {
      //   handle,
      // },
      // seo: {
      //   title,
      //   description,
      //   image,
      //   noIndex: !!noIndex,
      //   noFollow: !!noFollow,
      // },
    // }

    const {
      title,
      handle,
      tags,
      image,
      seo,
      contentHtml,
      authorV2,
    } = shopifyArticle

    const newArticleInput = {
      blogId: packBlogId,
      title,
      handle,
      description: seo?.description || null,
      author: authorV2?.name || null,
      tags: tags ? tags : [],
      excerpt: seo?.description || null,
      bodyHtml: contentHtml,
      seo: {
        title: seo.title ? seo.title : title,
        description: seo.description || null,
        image: image.url,
        noIndex: false,
        noFollow: false,
      },
    }

    const result = await client.mutate({
      mutation: CREATE_ARTICLE,
      variables: {
        input: newArticleInput,
      },
    })

    return result;
}