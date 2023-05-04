const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { toHex } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}

app.use(cors());
app.use(express.json());

const balances = {
  "8f2a62590609392a330f": 100, //c1acf26dea165249b9fd216563ada1c75870dc5c6400e2e32ebd970d4f543124
  "8773010fb85474d3cf21": 50, //36e2c0dc64e05535260b460165cc26b0230c9b27468920fe614fde00a162c026
  "ad9d83b0fde0ff6fca20": 75, //c335dd172aa8fc862847a9cd1f65729200941b9e1233740ff3f253c7fe66b1cf
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const message = sender + recipient + amount
  const messageLength = message.length.toString();

  const formattedMessage = "\x19Ethereum Signed Message:\n" + messageLength + message;

  const messageHash = hashMessage(formattedMessage);

  console.log("signature: ", signature);
  console.log(typeof signature);

  const signatureBuffer = Buffer.from(Object.values(signature));
  const recovered = secp.recoverPublicKey(messageHash, signatureBuffer, recoveryBit);

  if (toHex(recovered).slice(-20) != sender) {
    return res.status(400).send({ message: "Invalid signature" });
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
