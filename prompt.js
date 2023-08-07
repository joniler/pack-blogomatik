import figlet from "figlet"
import chalk from "chalk";
import { input, confirm } from "@inquirer/prompts";
import { processBlogs } from "./process.js";
import { processArticles } from "./process.js";
import { promptWait } from "./utils/promptWait.js";

let userConfirmed = false
let isConfirmed = false

// Validate user input
const validateEntries = () => {
  return true
}

export const prompt = async () => {

  do {
    // Welcome message
    console.log(chalk.bgWhite(figlet.textSync("\nPack Blogomatik\n", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    })));
    console.log("\n")
    console.log("Press Ctrl+C to exit at any time.\n")

    // Get Shopify store URL from user
    if(process.env.SHOPIFY_STORE_URL !== "") {
      const useStoreUrl = await confirm({ message: `${chalk.white.italic("Shopify Store URL detected in .env file:")} \n ${chalk.blue.bold(process.env.SHOPIFY_STORE_URL)} \n ${chalk.bgGreen(" Press enter to use this URL or enter a new one ")}`, }, { clearPromptOnDone: true, })

      console.clear()

      if(!useStoreUrl) {
        const storeUrl = await input(
          { message: `${chalk.white.italic("Please enter your Shopify Store URL")} \n ${chalk.white.bold("Example: store.myshopify.com")}`},
          { clearPromptOnDone: true }
        )

        console.clear()

        if(storeUrl) {
          process.env.SHOPIFY_STORE_URL = storeUrl
        }
      }
    } else {
      const storeUrl = await input(
        { message: `${chalk.white.italic("Please enter your Shopify Store URL")} \n ${chalk.white.bold("Example: store.myshopify.com")}`},
        { clearPromptOnDone: true }
      )

      console.clear()

      if(storeUrl) {
        process.env.SHOPIFY_STORE_URL = storeUrl
      }
    }

    // Get Shopify Storefront API Key from user
    if(process.env.SHOPIFY_STOREFRONT_API_KEY !== "") {
      const storefrontApiKey = await input({ message: `${chalk.white.italic("Shopify Storefront API Key detected in .env file:")} \n ${chalk.blue.bold(process.env.SHOPIFY_STOREFRONT_API_KEY)} \n ${chalk.bgGreen(" Press enter to use this URL or enter a new one ")}`, }, { clearPromptOnDone: true, })

      console.clear()

      if(storefrontApiKey) {
        process.env.SHOPIFY_STOREFRONT_API_KEY = storefrontApiKey
      }
    } else {
      const storefrontApiKey = await input(
        { message: `${chalk.white.italic("Please enter your Shopify Storefront API Key")} \n ${chalk.white.bold("Example: shpss_1234567890abcdef1234567890abcdef")}`},
        { clearPromptOnDone: true }
      )

      console.clear()

      if(storefrontApiKey) {
        process.env.SHOPIFY_STOREFRONT_API_KEY = storefrontApiKey
      }
    }

    // Get Pack secret from user
    if(process.env.PACK_STOREFRONT_SECRET !== "") {
      if(process.env.PACK_STOREFRONT_SECRET) {
        const usePackSecret = await confirm(
          { message: `${chalk.white.italic("Pack secret detected in .env file:")} \n ${chalk.blue.bold(process.env.PACK_STOREFRONT_SECRET)} \n ${chalk.bgGreen(" Press enter to use this URL or enter a new one ")}`},
          { clearPromptOnDone: true }
        )

        console.clear()

        if(!usePackSecret) {
          const packStorefrontSecret = await input(
            { message: `${chalk.white.italic("Please enter your Pack secret")} \n ${chalk.white.bold("Example: abcdef1234567890abcdef")}`},
            { clearPromptOnDone: true }
          )

          if(packStorefrontSecret) {
            process.env.PACK_STOREFRONT_SECRET = packStorefrontSecret
          }
        }
      }
    } else {
      const packStorefrontSecret = await input(
        { message: `${chalk.white.italic("Please enter your Pack secret")} \n ${chalk.white.bold("Example: abcdef1234567890abcdef")}`},
        { clearPromptOnDone: true }
      )

      console.clear()

      if(packStorefrontSecret) {
        process.env.PACK_STOREFRONT_SECRET = packStorefrontSecret
      }
    }

    // Verify user input
    const inputValid = validateEntries();

    if(inputValid) {
      userConfirmed = await confirm(
        { message: `${chalk.white.italic("Everything looks valid! Please confirm your entries are correct to continue...")} \n Shopify Store URL: ${chalk.blue.bold(process.env.SHOPIFY_STORE_URL)} \n Shopify Storefront API Key: ${chalk.blue.bold(process.env.SHOPIFY_STOREFRONT_API_KEY)} \n Pack secret: ${chalk.blue.bold(process.env.PACK_STOREFRONT_SECRET)} \n ${chalk.bgGreen(" Press ENTER to continue.")}`},
        { clearPromptOnDone: true }
      )
    }

    console.clear()

    if(inputValid && userConfirmed) {
      console.log(`${chalk.green.bold("🎉🎉🎉 Great! Let's get started... 🎉🎉🎉\n")}`)
      isConfirmed = true
    } else {
      console.log(`${chalk.bgRed("\nInput invalid or user did not confirm action. Please try again.\n")}`)
      isConfirmed = false
    }

    const confirmStart = await confirm(
      { message: `${chalk.white.italic("Ready to start the sync?")} \n ${chalk.bgGreen(" Press enter to continue or ctrl+c to exit ")}`},
      { clearPromptOnDone: true }
    );

    console.clear()

    if(!confirmStart) {
      console.log(`${chalk.bgRed("\nBlog sync cancelled. Exiting...\n")}`)
      process.exit(0)
    }

    if(confirmStart) {
      // Notify user that blog sync is starting, clear console
      console.log(`${chalk.white.italic("Starting blog sync...")}`)
      await promptWait(() => console.clear(), 2000)

      // Fetch all blogs from Shopify & Pack, compare, and prompt user to confirm adding new blogs to Pack
      try {
        await processBlogs();
      } catch (error) {
        console.log(chalk.red.bold("\nFailed to sync blogs. Exiting..."))
        console.log(chalk.bgRed(error))
      }

      // Notify that articles will be added to Pack, clear console
      console.log(`${chalk.white.italic("\nStarting article sync...\n")}`)
      await promptWait(() => console.clear(), 3000)

      // Once blogs are added, ask user if they want to import articles from Shopify
      try {
        await processArticles();
        console.log(`${chalk.bgGreen.white.bold("🎉🎉🎉 Sync complete! 🎉🎉🎉")}`)
        process.exit(0)
      } catch (error) {
        console.log(chalk.red.bold("\nFailed to sync articles. Exiting..."))
        console.log(chalk.bgRed(error))
        process.exit(0)
      }
    }
  } while (!isConfirmed)
};