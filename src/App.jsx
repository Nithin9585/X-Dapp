import { useState, useEffect } from "react";
import { Heart, Loader } from "lucide-react";
import { getEthereumContract } from "./config";
import { ethers } from "ethers";
import Spline from '@splinetool/react-spline';
import "./App.css";

function App() {
  const [tweets, setTweets] = useState([]);
  const [tweetText, setTweetText] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [likedTweets, setLikedTweets] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [tweeting, setTweeting] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        setUserAddress(accounts[0]);
        fetchTweets();
      }
    } catch (error) {}
  };

  const fetchTweets = async () => {
    setIsLoading(true);
    try {
      const contract = await getEthereumContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      if (!userAddress) return;
      const tweets = await contract.getTweets(userAddress);
      const likedStatuses = {};
      const parsedTweets = tweets.map((tweet) => ({
        id: Number(tweet[0]),
        author: tweet[1],
        content: tweet[2],
        timestamp: Number(tweet[3]),
        likes: Number(tweet[4]),
      }));
      setTweets(parsedTweets);
      setLikedTweets(likedStatuses);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (author, tweetId) => {
    setLoadingLikes((prev) => ({ ...prev, [tweetId]: true }));
    try {
      const contract = await getEthereumContract();
      if (!contract) return;
      const tx = await contract.likeTweet(author, tweetId);
      await tx.wait();
      setLikedTweets((prev) => ({ ...prev, [tweetId]: true }));
      fetchTweets();
    } catch (error) {} 
    finally {
      setLoadingLikes((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  const handleUnlike = async (author, tweetId) => {
    setLoadingLikes((prev) => ({ ...prev, [tweetId]: true }));
    try {
      const contract = await getEthereumContract();
      if (!contract) return;
      const tx = await contract.unlike(author, tweetId);
      await tx.wait();
      setLikedTweets((prev) => ({ ...prev, [tweetId]: false }));
      fetchTweets();
    } catch (error) {} 
    finally {
      setLoadingLikes((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  const handleTweetSubmit = async () => {
    if (tweetText.trim() === "") {
      alert("Tweet cannot be empty!");
      return;
    }
    setTweeting(true);
    try {
      const contract = await getEthereumContract();
      if (!contract) return;
      const tx = await contract.createTweet(tweetText);
      await tx.wait();
      setTweetText("");
      fetchTweets();
    } catch (error) {} 
    finally {
      setTweeting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="background-container">
        <Spline scene="https://prod.spline.design/FkesDrf592TxR-wW/scene.splinecode" />
      </div>

      <div className="content">
        <h1 className="app-title">X Dapp</h1>
        {isWalletConnected && <p className="wallet-address">Connected as: {userAddress}</p>}

        <div className="wallet-section">
          <h2>Welcome to X Decentralized App</h2>
          {!isWalletConnected ? (
            <button className="wallet-connect-btn" onClick={checkWalletConnection}>
              Connect Wallet
            </button>
          ) : (
            <p className="connected-msg">Wallet Connected Successfully</p>
          )}
        </div>

        <div className="tweet-input-section">
          <textarea
            className="tweet-input-field"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="Tweet something..."
          />
          <button className="tweet-btn" onClick={handleTweetSubmit} disabled={tweeting}>
            {tweeting ? <Loader className="spinner" /> : "Tweet"}
          </button>
        </div>

        <div className="tweet-list">
          {isLoading ? (
            <p className="loading">Loading tweets...</p>
          ) : (
            tweets.map((tweet) => (
              <div key={tweet.id} className="tweet">
                <div className="tweet-author">By: {tweet.author}</div>
                <p className="tweet-content">{tweet.content}</p>
                <div className="tweet-footer">
                  <div className="tweet-actions">
                  <button
  className="like-btn"
  onClick={() =>
    likedTweets[tweet.id]
      ? handleUnlike(tweet.author, tweet.id)
      : handleLike(tweet.author, tweet.id)
  }
  disabled={loadingLikes[tweet.id]}
>
  {loadingLikes[tweet.id] ? (
    <Loader className="spinner" />
  ) : (
    <div className="like-container">
      <Heart
        className="heart-icon"
        fill={likedTweets[tweet.id] ? "#ff69b4" : "none"} 
        stroke={likedTweets[tweet.id] ? "#ff69b4" : "#ff69b4"} 
        strokeWidth="2"
      />
      <span className="like-count">{tweet.likes}</span>
    </div>
  )}
</button>


                  </div>
                  <div className="timestamp-container">
                    <span className="tweet-timestamp">{new Date(tweet.timestamp * 1000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
