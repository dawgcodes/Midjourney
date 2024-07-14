# Midjourney
Midjourney is a versatile Discord bot that now also offers text-to-text capabilities through its integration with Google Gemini, an advanced text generation model platform. It automatically responds to specific commands on Discord, generating text or images based on the nature of users' requests.

## Installation

[x] Create Discord Bot and get token and client id from [Discord Developer Portal](https://discord.com/developers/applications)

[x] Download [Node.js](https://nodejs.org/en/download/)

[x] Create [Replicate](https://replicate.com/) account and get token

[x] Download Midjourney


## 🚀 Installation from source

1. Clone the Midjourney repository:

```bash
git clone https://github.com/dawgcodes/Midjourney.git
```


2. change the directory to Midjourney

```bash
cd Midjourney
```

3. Install the required packages:

```bash
npm i
or
yarn i
```

4. Set up your environment variables:

Create a `.env` file in the root directory of your project with the following variables:
or you can use the [.env.example](https://raw.githubusercontent.com/LucasB25/AikouAI/main/.env.example) file

```bash
TOKEN= #Discord Bot Token
CLIENT_ID= #Discord Bot Client ID
ACTIVITY=/help

#For REPLICATE
REPLICATE_TOKEN= #Replicate Token from https://replicate.com/signin
REPLICATE_MODEL=bytedance/sdxl-lightning-4step:727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a

#For GEMINI
GEMINI_KEY= #GEMINI key from https://makersuite.google.com/
GEMINI_MODEL=gemini-1.5-flash-latest
```

5. Run the bot:

```bash
npm start
```

## 📜 Contributing

Thank you for your interest in contributing to AikouAI! Here are some guidelines to follow when contributing:

1. Fork the repository and create a new branch for your feature or bug fix.
2. Write clean and concise code that follows the established coding style.
3. Create detailed and thorough documentation for any new features or changes.
4. Write and run tests for your code.
5. Submit a pull request with your changes.

Your contribution will be reviewed by the project maintainers, and any necessary feedback or changes will be discussed with you. We appreciate your help in making Midjourney better!

## 👥 Contributors

Thanks goes to these wonderful people :

<a href="https://github.com/dawgcodes/Midjourney/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=dawgcoes/Midjourney" />
</a>



## License
[MIT](https://choosealicense.com/licenses/mit/)
