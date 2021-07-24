import {decode, Jwt, JwtPayload, verify} from "jsonwebtoken";
import axios from "axios";
import {JWKS_URL} from "../utils/env";
import {createLogger} from "../utils/logger";
import jwkToBuffer from 'jwk-to-pem';

const logger = createLogger('jwt');

// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = JWKS_URL;
//cached JWKS key
let cachedJWKS = null;

async function downloadJWKS(): Promise<any> {
    if (cachedJWKS == null) {
        logger.debug("JWKS not cached. Downloading from: " + jwksUrl);
        const response = await axios.get(jwksUrl)
        if (response.status !== 200) {
            throw new Error('Unable to download JWKS key')
        }
        const keys = response.data.keys
        if (!keys || !keys.length) {
            throw new Error('The JWKS endpoint did not contain any keys')
        }

        cachedJWKS = keys;
        logger.debug("Downloaded JWKS: %s", cachedJWKS);
    }
    return cachedJWKS;
}

async function getSigningKey(kid: string): Promise<any> {
    const keys = await downloadJWKS();
    const signingKey = keys.find(key => key.kid === kid);
    if (!signingKey) {
        throw new Error(`Unable to find a signing key that matches '${kid}'`);
    }
    logger.debug("getSigningKey: %s", JSON.stringify(signingKey));
    return signingKey;
}

export async function verifyToken(authHeader: string, decodeHeader: boolean = true): Promise<JwtPayload> {

    let token = authHeader;

    if(decodeHeader) {
        token = getToken(authHeader);
    }

    const jwt: Jwt = decode(token, { complete: true });

    if (!jwt.header || jwt.header.alg !== 'RS256') {
        throw new Error("Only RS256 is supported");
    }

    logger.debug("Decoded JWT: ", jwt);

    const key = await getSigningKey(jwt.header.kid);

    logger.debug("Selected KEY: ", key);

    const jwkBuffer = jwkToBuffer(key);

    try {
        logger.debug("Verify: ", key);
        verify(token, jwkBuffer, { algorithms: [jwt.header.alg]});
    } catch(err) {
        logger.error(err, token);
        throw new Error("Failed to verify token: " + token);
    }
    return jwt.payload;
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}
