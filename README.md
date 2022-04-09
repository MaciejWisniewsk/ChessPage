# ChessPage

## Description

This is a web application I've created for my course on university called Web protocols. The task was to create web application using mqtt and http protocols. After creating an account user can create game rooms where they can chat with each other and play chess

## Link

I've deployed this page on [DigitalOcean](https://www.digitalocean.com/) server. For mongo database storage I've used [MongoDb Atlas](https://www.mongodb.com/atlas/database). For broker I've used [HiveMq Cloud](https://www.hivemq.com/mqtt-cloud-broker/).

The page is available under url: [chesspage.me](https://chesspage.me)

## Styles

For majority of styles in this page I've used Bootstrap 5.

## Accounts

To play a game user has to create an account. Passwords are encrypted using passport-local-mongoose npm package.

## Rooms

After creating rooms user has to wait until someone else joins it. Available rooms are updating automatically thank to mqtt protocol. User doesn't have to refresh the page. When someone joins the room the room will be shown in **Your Active Games** list. Then user has to click Play button to display the game room.

## Ranking

After each game user who won gains 1 point and user who lost loses 1 point. In case of draw users points remain unchanged. User cannot have less than 0 points.

## Forum

Users can add posts and comment them. They can edit and delete them too.

## Background Images

Background images are from [Unsplash](https://unsplash.com/)

## Game

For chessboard and game logic I've used 2 libraries: [chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) and [chessboard.js](https://chessboardjs.com/)
