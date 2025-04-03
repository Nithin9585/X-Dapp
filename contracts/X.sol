// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.26;

contract Twitter {
    uint16 public MAX_TWEET_LENGTH = 280;

    struct Tweet {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }

    mapping(address => Tweet[]) public tweets;
    address public owner;

    event TweetCreated(uint256 id, address author, string content, uint256 timestamp);
    event TweetLiked(address Liker, address author, uint256 tweetId, uint256 timestamp, uint256 newLike);
    event TweetUnlike(address Liker, address author, uint256 tweetId, uint256 timestamp, uint256 newLike);

    constructor() {
        owner = msg.sender;
    }

    function createTweet(string memory _tweet) public {
        require(bytes(_tweet).length <= MAX_TWEET_LENGTH, "Tweet exceeds max length");

        Tweet memory newTweet = Tweet({
            id: tweets[msg.sender].length,
            author: msg.sender,
            content: _tweet,
            timestamp: block.timestamp,
            likes: 0
        });

        tweets[msg.sender].push(newTweet);
        emit TweetCreated(newTweet.id, newTweet.author, newTweet.content, newTweet.timestamp);
    }

    function likeTweet(address author, uint256 id) external {
        require(tweets[author][id].id == id, "Tweet Does Not Exist");

        tweets[author][id].likes++;
        emit TweetLiked(msg.sender, author, id, block.timestamp, tweets[author][id].likes);
    }

    function unlike(address author, uint256 id) external {
        require(tweets[author][id].id == id, "Tweet Does Not Exist");
        require(tweets[author][id].likes > 0, "No likes to unlike");

        tweets[author][id].likes--;
        emit TweetUnlike(msg.sender, author, id, block.timestamp, tweets[author][id].likes);
    }

    function getTweets(address author) public view returns (Tweet[] memory) {
        return tweets[author];
    }

    function getTweetContent(address author, uint256 _i) public view returns (string memory) {
        return tweets[author][_i].content;
    }
}
