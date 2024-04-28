import 'dotenv/config';

export default {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    color: process.env.COLOR,
    replicateToken: process.env.REPLICATE_TOKEN,
    model: process.env.MODEL as any,
};
