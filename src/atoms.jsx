import { atom,  selectorFamily} from 'recoil'
import { ethers, HDNodeWallet } from 'ethers'



const containersFamily = selectorFamily({
    key: 'containersFamily',
    get: (i) => ({ get }) => {
      const seed_p = get(seed_phrase);
      const derivationPath = `44'/60'/0'/0/${i}`;
      const hdNode = HDNodeWallet.fromPhrase(seed_p.phrase);
      const wallet = hdNode.derivePath(derivationPath);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        index: i
      };
    }
});
const d_id = atom({
    key: "uid",
    default: 0
})
const seed_phrase = atom({
    key:"seed_phrase",
    default: {
      phrase: "",
    }
})


const clearKeysAtom = atom({
  key: 'clearKeys',
  default: false,
});

export {  containersFamily, seed_phrase, d_id, clearKeysAtom };
