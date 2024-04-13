# Midjourney
 A Discord Bot that can generate text based on a given prompt using [Replicate](https://replicate.com/)

## Installation

[x] Create Discord Bot and get token and client id from [Discord Developer Portal](https://discord.com/developers/applications)

[x] Download [Node.js](https://nodejs.org/en/download/)

[x] Create [Replicate](https://replicate.com/) account and get token

[x] Download Midjourney

```bash
git clone https://github.com/brblacky/Midjourney.git
cd Midjourney
npm install
```
## Configuration

[x] Edit `config.ts` file

```ts
export default {
    token: "", // Discord Bot Token
    clientId: "1109838882805125190", // Discord Bot Client ID
    color: "#00ff00",
    replicateToken: "", // Replicate Token from https://replicate.com/signin
    model: "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf" as any
}
```
## Usage

```bash
npm start
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License
[MIT](https://choosealicense.com/licenses/mit/)
