import figlet from "figlet"
import chalk from "chalk";
import { input, confirm } from "@inquirer/prompts";

let userConfirmed = false
let isConfirmed = false
let blogList = []

// Validate user input
const validateEntries = () => {
  return true
}

export const prompt = async () => {

  do {
    // Welcome message
    console.log(chalk.bgWhite(figlet.textSync("\n\nPack Blogomatik\n\n", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    })));
    console.log("\n\n")
    console.log("Press Ctrl+C to exit at any time.\n\n")

    // Get Shopify store URL from user
    if(process.env.SHOPIFY_STORE_URL !== "") {
      const useStoreUrl = await confirm({ message: `${chalk.white.italic("Shopify Store URL detected in .env file:")} \n\n ${chalk.blue.bold(process.env.SHOPIFY_STORE_URL)} \n\n ${chalk.bgGreen(" Press enter to use this URL or enter a new one ")}`, }, { clearPromptOnDone: true, })

      if(!useStoreUrl) {
        const storeUrl = await input(
          { message: `${chalk.white.italic("Please enter your Shopify Store URL")} \n\n ${chalk.white.bold("Example: store.myshopify.com")}`},
          { clearPromptOnDone: true }
        )

        if(storeUrl) {
          process.env.SHOPIFY_STORE_URL = storeUrl
        }
      }
    } else {
      const storeUrl = await input(
        { message: `${chalk.white.italic("Please enter your Shopify Store URL")} \n\n ${chalk.white.bold("Example: store.myshopify.com")}`},
        { clearPromptOnDone: true }
      )

      if(storeUrl) {
        process.env.SHOPIFY_STORE_URL = storeUrl
      }
    }

    // Get Shopify Storefront API Key from user
    if(process.env.SHOPIFY_STOREFRONT_API_KEY !== "") {
      const storefrontApiKey = await input({ message: `${chalk.white.italic("Shopify Storefront API Key detected in .env file:")} \n\n ${chalk.blue.bold(process.env.SHOPIFY_STOREFRONT_API_KEY)} \n\n ${chalk.bgGreen(" Press enter to use this URL or enter a new one ")}`, }, { clearPromptOnDone: true, })

      if(storefrontApiKey) {
        process.env.SHOPIFY_STOREFRONT_API_KEY = storefrontApiKey
      }
    } else {
      const storefrontApiKey = await input(
        { message: `${chalk.white.italic("Please enter your Shopify Storefront API Key")} \n\n ${chalk.white.bold("Example: shpss_1234567890abcdef1234567890abcdef")}`},
        { clearPromptOnDone: true }
      )

      if(storefrontApiKey) {
        process.env.SHOPIFY_STOREFRONT_API_KEY = storefrontApiKey
      }
    }

    // Get Pack secret from user
    if(process.env.PACK_STOREFRONT_SECRET !== "") {
      if(process.env.PACK_STOREFRONT_SECRET) {
        const usePackSecret = await confirm(
          { message: `${chalk.white.italic("Pack secret detected in .env file:")} \n\n ${chalk.blue.bold(process.env.PACK_STOREFRONT_SECRET)} \n\n ${chalk.bgGreen(" Press enter to use this URL or enter a new one ")}`},
          { clearPromptOnDone: true }
        )

        if(!usePackSecret) {
          const packStorefrontSecret = await input(
            { message: `${chalk.white.italic("Please enter your Pack secret")} \n\n ${chalk.white.bold("Example: abcdef1234567890abcdef")}`},
            { clearPromptOnDone: true }
          )

          if(packStorefrontSecret) {
            process.env.PACK_STOREFRONT_SECRET = packStorefrontSecret
          }
        }
      }
    } else {
      const packStorefrontSecret = await input(
        { message: `${chalk.white.italic("Please enter your Pack secret")} \n\n ${chalk.white.bold("Example: abcdef1234567890abcdef")}`},
        { clearPromptOnDone: true }
      )

      if(packStorefrontSecret) {
        process.env.PACK_STOREFRONT_SECRET = packStorefrontSecret
      }
    }

    // Verify user input
    const inputValid = validateEntries();

    if(inputValid) {
      userConfirmed = await confirm(
        { message: `${chalk.white.italic("Everything looks valid! Please confirm your entries are correct to continue...")} \n\n Shopify Store URL: ${chalk.blue.bold(process.env.SHOPIFY_STORE_URL)} \n\n Shopify Storefront API Key: ${chalk.blue.bold(process.env.SHOPIFY_STOREFRONT_API_KEY)} \n\n Pack secret: ${chalk.blue.bold(process.env.PACK_STOREFRONT_SECRET)} \n\n ${chalk.bgGreen(" Press enter to continue or enter a new one ")}`},
        { clearPromptOnDone: true }
      )
    }

    if(inputValid && userConfirmed) {
      console.log(`${chalk.green.bold("🎉🎉🎉 Great! Let's get started... 🎉🎉🎉\n\n")}`)
      isConfirmed = true
    } else {
      console.log(`${chalk.bgRed("\n\nInput invalid or user did not confirm action. Please try again.\n\n")}`)
      isConfirmed = false
    }

  } while (!isConfirmed)
};