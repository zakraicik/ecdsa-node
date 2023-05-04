const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

function hashMessage(message) {
    const bytes = utf8ToBytes(message);
    return keccak256(bytes);
}

async function signMessage(msg, private_key) {

    const messageHash = hashMessage(msg);

    return secp.sign(messageHash, private_key, { recovered: true });
}

async function recoverKey(message, signature, recoveryBit) {
    const hashedMessage = hashMessage(message);
    return secp.recoverPublicKey(hashedMessage, signature, recoveryBit);
}

async function run() {
    const msg = "I love Zak";
    const randomPrivateKey = secp.utils.randomPrivateKey()
    const publicKey = secp.getPublicKey(randomPrivateKey)
    const [signature, recoveryBit] = await signMessage(msg, toHex(randomPrivateKey));
    const recovered = await recoverKey(msg, signature, recoveryBit);

    console.log("randomPrivateKey: ", toHex(randomPrivateKey));
    console.log("publicKey: ", toHex(publicKey).slice(-20));
    console.log("recovered: ", toHex(recovered).slice(-20));
}

run();


