# Super Rich

Minigames Integration API Coin Flip Specification

Strictly Confidential \- for intended purposes and recipients only\!

Latest update : 15 \- 10 \- 2025

# API Specification Doc {#api-specification-doc}

| Version | Date | Author | Description |
| :---- | :---- | :---- | :---- |
| 1.0 | 15-10-2025 | Ton | Initial Draft |

# Index {#index}

[API Specification Doc](#api-specification-doc)

[Index](#index)

[I. API Overview](#api-overview)

[1.1 Configuration](#configuration)

[1.2 Token](#token)

[1.3 Structure Response](#structure-response)

[II. Integration API](#integration-api)

[2.1. Last Activity](#last-activity)

[2.2. Bet](#bet)

[2.3. Skip](#skip)

[2.4. Pick](#pick)

[2.5. Cashout](#cashout)

[2.6. Result](#result)

[2.7. History](#history)

[2.8. History Detail](#history-detail)

[Glossary](#glossary)

[Status Codes](#status-codes)

[Currency](#currency)

[Transaction Types](#transaction-types)

[Language](#language)

1. # API Overview {#api-overview}

1. ## Configuration {#configuration}

Before you start building and testing your API Connection, please make sure that you have gotten the following credential. Credential is given from the Super Rich. 

* **Base URL** 	: the URL development that will be used during development.  
  * **Token** 	: Super Rich will provide a unique secret key as a signature to authenticate the client to the game.

2. ## Token {#token}

To successfully communicate with the API, you **must provide** the following token **in every API request:**

| Params | Type | Values |
| :---- | :---- | :---- |
| token | String | Unique secret key |

| {     “token” : “xxxxxxxxxx” } |
| :---- |

3. ## Structure Response {#structure-response}

The API returns JSON-formatted responses for both successful and failed requests. Clients are required to return an API response with an HTTP **success status code (200) for all types of requests**. The API utilizes a global JSON response format for all methods, with the following content type is **application/json**. Additional information on the response structure is provided based on the [status code](#status-codes).

***Successful Response***

| { "data" : {  \[API method response. JSON object format may vary depending on API methods\]  } "error" : null } |
| :---- |

***Failed/Error Response***

| { "data" : null, "error" : {              "code": "\[Error code\]",          "message": "\[Error message\]"  } }  |
| :---- |

2. # Integration API {#integration-api}

   

1. ## Last Activity {#last-activity}

This API retrieves the last activity of a selected game and can also be used for session reconnection.

***Request***

| Method | URL |
| :---- | :---- |
| **GET** | \[BaseApiUrl\]/games/minigames/last-activity |

***Example of HTTP Request***

| GET /\[BaseApiUrl\]/games/mingames/last-activity HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| username | String | The player’s username |
| balance | Number | The player’s current account balance |
| currency | String | The currency code associated with the balance (e.g., IDR) |
| last\_activity | Object | Indicates whether the player has recent activity |
| pick | Integer | The number of steps or tiles opened on the board |
| coin\_field | Array | The coin position selected by the player |
| coin\_field\_result | Array | The coin result position |
| amount | Number | The wager amount placed by the player |
| multiplier | Number | The win multiplier applied to the bet |
| total\_win | Number | The total winnings accumulated in the round |
| is\_settle | String | Indicates whether the game round has been settled |
| end\_round | Boolean | Marks whether the round has ended (true or false) |
| last\_bet | Number | Details of the player’s most recent bet |

***Response Success Example***

| {     "data": {         "username": "xx\_user",         "balance": 5000000,         "currency": "IDR",         "last\_activity": {            "pick": 2,             "coin\_field": \[                 0,                 1             \],             "coin\_field\_result": \[                 0,                 1             \],             "amount": 1000,             "multiplier": 3.92,             "total\_win": 3920,             "is\_settle": true,             "end\_round": true         },         "last\_bet": 1000     },     "error": null } |
| :---- |

2. ## Bet {#bet}

This API allows the player to place a bet within the game session.

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/bet |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/bet HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |
| amount | Number | Yes | The player’s current bet amount. |
| action | String | Yes | Defines the action to perform. For example, "start" indicates the beginning of a new game round. |

***Request Body Example***

| {     "token": "xxxxxxxxxx",     "amount": "1000",     "action": "start" } |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| username | String | The player’s username |
| balance | Number | The player’s current account balance |
| currency | String | The currency code associated with the balance (e.g., IDR) |
| pick | Integer | The number of steps or tiles opened on the board |
| rank | Integer | Card rank represented as numbers 1–13, where 1 \= Ace and 13 \= King. |
| suit | Integer | Card suit represented numerically: 1 \= Diamonds (♦), 2 \= Clubs (♣), 3 \= Hearts (♥), 4 \= Spades (♠). |
| history\_cards | Array | A collection of previously drawn cards, stored for tracking game history. Example **n-1-5-0.00**n \= new (s \= skip, h \= higher, l \= lower)1 \= suit5 \= rank0.00 \= multiplier |
| chance\_up | Number | The probability (in percentage) that the next card will be higher than the current one. |
| chance\_down | Number | The probability (in percentage) that the next card will be lower than the current one. |
| amount | Number | The wager amount placed by the player |
| multiplier | Number | The win multiplier applied to the bet |
| total\_win | Number | The total winnings accumulated in the round |
| end\_round | Boolean | Marks whether the round has ended (true or false) |

***Response Success Example***

| {     "data": {         "username": "xx\_user",         "balance": 10098280.5,         "currency": "IDR",         "pick": 0,         "rank": 5,         "suit": 1,         "history\_cards": \[             "n-1-5-0.00"         \],         "chance\_up": 69.23,         "chance\_down": 38.46,         "amount": 1000,         "multiplier": 0,         "total\_win": 0,         "end\_round": false     },     "error": null }  |
| :---- |

3. ## Skip {#skip}

This API allows the player to skip reveal card on the game board.

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/pick |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/pick HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |
| action | String | Yes | Defines the action to perform. For example, "start" indicates the beginning of a new game round. |

***Request Body Example***

| {     "token": "xxxxxxxxxx",     "action": "skip" } |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| username | String | The player’s username |
| balance | Number | The player’s current account balance |
| currency | String | The currency code associated with the balance (e.g., IDR) |
| pick | Integer | The number of steps or tiles opened on the board |
| rank | Integer | Card rank represented as numbers 1–13, where 1 \= Ace and 13 \= King. |
| suit | Integer | Card suit represented numerically: 1 \= Diamonds (♦), 2 \= Clubs (♣), 3 \= Hearts (♥), 4 \= Spades (♠). |
| history\_cards | Array | A collection of previously drawn cards, stored for tracking game history. Example **n-1-5-0.00**n \= new (s \= skip, h \= higher, l \= lower)1 \= suit5 \= rank0.00 \= multiplier |
| chance\_up | Number | The probability (in percentage) that the next card will be higher than the current one. |
| chance\_down | Number | The probability (in percentage) that the next card will be lower than the current one. |
| amount | Number | The wager amount placed by the player |
| multiplier | Number | The win multiplier applied to the bet |
| total\_win | Number | The total winnings accumulated in the round |
| end\_round | Boolean | Marks whether the round has ended (true or false) |

***Response Success Example***

| {     "data": {         "pick": 0,         "rank": 13,         "suit": 4,         "history\_cards": \[             "n-1-5-0.00",             "s-2-4-0.00",             "s-3-3-0.00",             "s-2-9-0.00",             "s-2-7-0.00",             "s-3-11-0.00",             "s-4-6-0.00",             "s-4-13-0.00"         \],         "chance\_up": 7.69,         "chance\_down": 92.31,         "amount": 1000,         "multiplier": 0,         "total\_win": 0,         "end\_round": false     },     "error": null }  |
| :---- |

4. ## Pick {#pick}

This API allows the player to manually choose higher or lower for the next card on the game.

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/pick |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/pick HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |
| action | String | Yes | Defines the action to perform. For example, "start" indicates the beginning of a new game round. |

***Request Body Example***

| {     "token": "xxxxxxxxxx",     "action": "lower" // higher or lower } |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| username | String | The player’s username |
| balance | Number | The player’s current account balance |
| currency | String | The currency code associated with the balance (e.g., IDR) |
| pick | Integer | The number of steps or tiles opened on the board |
| rank | Integer | Card rank represented as numbers 1–13, where 1 \= Ace and 13 \= King. |
| suit | Integer | Card suit represented numerically: 1 \= Diamonds (♦), 2 \= Clubs (♣), 3 \= Hearts (♥), 4 \= Spades (♠). |
| history\_cards | Array | A collection of previously drawn cards, stored for tracking game history. Example **n-1-5-0.00**n \= new (s \= skip, h \= higher, l \= lower)1 \= suit5 \= rank0.00 \= multiplier |
| chance\_up | Number | The probability (in percentage) that the next card will be higher than the current one. |
| chance\_down | Number | The probability (in percentage) that the next card will be lower than the current one. |
| amount | Number | The wager amount placed by the player |
| multiplier | Number | The win multiplier applied to the bet |
| total\_win | Number | The total winnings accumulated in the round |
| end\_round | Boolean | Marks whether the round has ended (true or false) |

***Response Success Example***

| {     "data": {         "pick": 1,         "rank": 10,         "suit": 3,         "history\_cards": \[             "n-1-5-0.00",             "s-2-4-0.00",             "s-3-3-0.00",             "s-2-9-0.00",             "s-2-7-0.00",             "s-3-11-0.00",             "s-4-6-0.00",             "s-4-13-0.00",             "l-3-10-1.06"         \],         "chance\_up": 30.77,         "chance\_down": 76.92,         "amount": 1000,         "multiplier": 1.0616,         "total\_win": 1060,         "end\_round": false     },     "error": null }  |
| :---- |

5. ## Cashout {#cashout}

This API allows the player to cash out their current winnings, finalizing the bet and closing the active game round.

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/cashout |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/cashout HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |

***Request Body Example***

| {     "token": "xxxxxxxxxx" } |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| username | String | The player’s username |
| balance | Number | The player’s current account balance |
| currency | String | The currency code associated with the balance (e.g., IDR) |
| pick | Integer | The number of steps or tiles opened on the board |
| rank | Integer | Card rank represented as numbers 1–13, where 1 \= Ace and 13 \= King. |
| suit | Integer | Card suit represented numerically: 1 \= Diamonds (♦), 2 \= Clubs (♣), 3 \= Hearts (♥), 4 \= Spades (♠). |
| history\_cards | Array | A collection of previously drawn cards, stored for tracking game history. Example **n-1-5-0.00 \- \=** separatorn \= new (s \= skip, h \= higher, l \= lower)1 \= suit5 \= rank0.00 \= multiplier |
| chance\_up | Number | The probability (in percentage) that the next card will be higher than the current one. |
| chance\_down | Number | The probability (in percentage) that the next card will be lower than the current one. |
| amount | Number | The wager amount placed by the player |
| multiplier | Number | The win multiplier applied to the bet |
| total\_win | Number | The total winnings accumulated in the round |
| end\_round | Boolean | Marks whether the round has ended (true or false) |

***Response Success Example***

| {     "data": {         "pick": 1,         "rank": 10,         "suit": 3,         "history\_cards": \[             "n-1-5-0.00",             "s-2-4-0.00",             "s-3-3-0.00",             "s-2-9-0.00",             "s-2-7-0.00",             "s-3-11-0.00",             "s-4-6-0.00",             "s-4-13-0.00",             "l-3-10-1.06"         \],         "chance\_up": 30.77,         "chance\_down": 76.92,         "amount": 1000,         "multiplier": 1.0616,         "total\_win": 1060,         "end\_round": true     },     "error": null }  |
| :---- |

6. ## Result {#result}

This API is used to settle the game results and finalize the round with client.

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/result |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/result HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |

***Request Body Example***

| {     "token": "xxxxxxxxxx" }  |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| username | String | The player’s username |
| balance | Number | The player’s current account balance |
| currency | String | Currency of the player. |
| bonus\_event | Number | Identifier or flag indicating the active bonus event associated with the player. |

***Response Success Example***

| {     "data": {         "username": "xx\_user",         "balance": 9992390,         "currency": "IDR",         "bonus\_event": null     },     "error": null } |
| :---- |

7. ## History {#history}

This API retrieves the player’s game history, only of multiplier

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/history |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/history HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |

***Request Body Example***

| {     "token": "xxxxxxxxxx" } |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| bet\_id | String | Unique identifier of the bet. |
| multiplier | Number | The payout multiplier applied to the bet. |
| timestamp | Number | Unix timestamp in milliseconds |

***Response Success Example***

| {     "data": \[         {             "bet\_id": "68f0a83590773c4339036130",             "multiplier": 1.07,             "timestamp": 1760602203603         },         {             "bet\_id": "68edfe8690773c433903606e",             "multiplier": 0,             "timestamp": 1760427657992         },         {             "bet\_id": "68e482e58bc385c2a7072bfe",             "multiplier": 12.04,             "timestamp": 1759806182862         },         {             "bet\_id": "68e482e38bc385c2a7072bfb",             "multiplier": 0,             "timestamp": 1759806180393         },         {             "bet\_id": "68e482e08bc385c2a7072bf8",             "multiplier": 0,             "timestamp": 1759806177961         },         {             "bet\_id": "68e482de8bc385c2a7072bf5",             "multiplier": 0,             "timestamp": 1759806175535         },         {             "bet\_id": "68e482db8bc385c2a7072bf2",             "multiplier": 0,             "timestamp": 1759806173130         },         {             "bet\_id": "68e482d98bc385c2a7072bef",             "multiplier": 0,             "timestamp": 1759806170717         },         {             "bet\_id": "68e482cc8bc385c2a7072beb",             "multiplier": 0,             "timestamp": 1759806157752         },         {             "bet\_id": "68e482c78bc385c2a7072be7",             "multiplier": 0,             "timestamp": 1759806155638         }     \],     "error": null } |
| :---- |

8. ## History Detail {#history-detail}

This API provides detailed records of the player’s game history

***Request***

| Method | URL |
| :---- | :---- |
| **POST** | \[BaseApiUrl\]/games/minigames/history/690081a101cee1dc9ac68107 |

***Example of HTTP Request***

| POST /\[BaseApiUrl\]/games/minigames/history/690081a101cee1dc9ac68107 HTTP/1.1 Content-Type: application/json Cache-Control: no-cache, private |
| :---- |

***Request Body***

| Params | Type | Values | Description |
| :---- | :---- | :---- | :---- |
| token | String | Yes | Unique token id from login session on client website |

***Request Body Example***

| {     "token": "xxxxxxxxxx" } |
| :---- |

***Response***

| Params | Type | Values |
| :---- | :---- | :---- |
| data | Json | Data response |
| error | Object | Error response |

***JSON Data Information***

| Params | Type | Description |
| :---- | :---- | :---- |
| txId | String | A unique string identifier assigned to each bet transaction. |
| status | String | Status win or lose |
| debitAmount | Number | The amount bet from the player’s balance. |
| CreditAmount | Number | The amount credited back to the player’s balance after the bet is settled. |
| datetime | Datetime | Datetime of transaction (Server Time) |
| game\_info | Object | Detailed information about the game session associated with the bet. |
| pick | Integer | The number of steps or tiles opened on the board |
| rank | Integer | Card rank represented as numbers 1–13, where 1 \= Ace and 13 \= King. |
| suit | Integer | Card suit represented numerically: 1 \= Diamonds (♦), 2 \= Clubs (♣), 3 \= Hearts (♥), 4 \= Spades (♠). |
| history\_cards | Array | A collection of previously drawn cards, stored for tracking game history. Example **n-1-5-0.00 \- \=** separatorn \= new (s \= skip, h \= higher, l \= lower)1 \= suit5 \= rank0.00 \= multiplier |
| chance\_up | Number | The probability (in percentage) that the next card will be higher than the current one. |
| chance\_down | Number | The probability (in percentage) that the next card will be lower than the current one. |
| amount | Number | The wager amount placed by the player |
| multiplier | Number | The win multiplier applied to the bet |
| total\_win | Number | The total winnings accumulated in the round |
| end\_round | Boolean | Marks whether the round has ended (true or false) |
| balance | Number | The player’s current account balance |

***Response Success Example***

| {     "data": \[         {             "txId": "690081a101cee1dc9ac68107",             "status": "win",             "debitAmount": 1000,             "creditAmount": 1060,             "datetime": "2025-10-28T08:41:05.366Z",             "game\_info": {                 "minigames": {                     "pick": 1,                     "rank": 10,                     "suit": 3,                     "history\_cards": \[                         "n-1-5-0.00",                         "s-2-4-0.00",                         "s-3-3-0.00",                         "s-2-9-0.00",                         "s-2-7-0.00",                         "s-3-11-0.00",                         "s-4-6-0.00",                         "s-4-13-0.00",                         "l-3-10-1.06"                     \],                     "chance\_up": 30.77,                     "chance\_down": 76.92,                     "amount": 1,                     "multiplier": 1.0616,                     "total\_win": 1.06                 },                 "end\_round": true             },             "balance": 10099340.5         }     \],     "error": null }  |
| :---- |

## 

## 

## 

## 

## 

# Glossary {#glossary}

## Status Codes {#status-codes}

All status codes are standard HTTP status codes. The below ones are used in this API.

| Status Code | Description |
| :---- | :---- |
| 200 | OK |

Appendix Error Code

| Code | Values |
| :---- | :---- |
| InvalidApiKey | API key is required or API key not found |
| InvalidPlayerToken | Player token is required or not found |
| InvalidRequest | Request is required or not found |
| InsufficientBalance | Balance is not enough for doing bet |
| PlayerNotExist | Player does not exist |
| BetNotFound | Invalid Bet Id |
| ConnectionTimeout | Error on connection |
| GameNotFound | Invalid game id or not found |
| RetryApiRequest | There is client having a issue on code |
| InvalidSignature | Signature not match |
| GameMaintenance | Game is current off |

## Currency {#currency}

| Currency Code | Currency Symbol | Currency Name | Base Unit |
| :---: | :---: | :---: | :---: |
| IDR | Rp | Indonesian Rupiah | 1000 |
| USD | $ | United States Dollar | 1 |

## Transaction Types {#transaction-types}

| Transaction | Description |
| :---: | :---: |
| Bet | The transaction is defined as a place bet |
| Win | The transaction is determined as the winning value |
| Lose | The transaction is determined as the losing value |
| Refund | Determined refund of all betting transactions |

## Language {#language}

| Code | Language |
| :---: | :---: |
| en | English (default) |
| id | Indonesian |

