import { atom, selector} from 'recoil'
import { ethers, HDNodeWallet } from 'ethers'


const containers = atom({
    key:"containers",
    default: []
})
const d_id = atom({
    key: "uid",
    default: 0
})
const seed_phrase = atom({
    key:"seed_phrase",
    default: ""
})

const public_key = selector({
  key: 'finding public key',
  get: ({ get }) => {
    const seed_p = get(seed_phrase);
    console.log("Seed phrase:", seed_p);
    const index = get(d_id)
    console.log("before deriving")
    const derivationPath = `44'/60'/0'/0/${index}`; // another learning, HDnodewallet function creates a master path, so we have to give it a child path as input, I wasted my 2 hrs figuring this out :(
    const hdNode = HDNodeWallet.fromPhrase(seed_p.phrase);
    console.log("after before deriving")
    const wallet = hdNode.derivePath(derivationPath);    
    console.log("after deriving")

    return wallet.address;
    
  },
})
const private_key = selector({
  key: 'finding private key',
  get: ({ get }) => {
    const seed_p = get(seed_phrase);
    console.log("Seed phrase:", seed_p);
    const index = get(d_id)
    console.log("before deriving")
    const derivationPath = `44'/60'/0'/0/${index}`;
    const hdNode = HDNodeWallet.fromPhrase(seed_p.phrase);
    console.log("after before deriving")
    const wallet = hdNode.derivePath(derivationPath);    
    console.log("after deriving")

    return wallet.privateKey;

  },
})
export { containers, public_key, private_key, seed_phrase, d_id };
