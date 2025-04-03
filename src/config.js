import { ethers } from "ethers";
import contractABI from "./abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ;
console.log("Contract Address:", CONTRACT_ADDRESS);

export const getEthereumContract = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!signer) {
        console.error("Signer not found!");
        return null;
      }

      const address = await signer.getAddress();

      if (!address) {
        console.error("User address is undefined or empty!");
        return null;
      }

      console.log("User address:", address);
      
      return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      return null;
    }
  } else {
    console.error("Ethereum object not found. Install MetaMask.");
    return null;
  }
};
