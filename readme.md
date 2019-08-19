## <center>E621 Api Module</center>

Currently, this module only supports fetching posts/post tags, the e621 api isn't very well documented, and it's hard to test things like creating posts, deleting posts, flagging posts, etc without getting barred from doing so, or just tossing in junk code, and hoping for the best. Some of the methods are sort of implemented, but they're commented out. I know I've done them wrong, which is why they are commented out. They were left there if I ever want to come back and try to solve them.

### This module does not filter ratings! For an sfw filter, see [E9API](https://npmjs.org/package/e9api), that module will return ONLY sfw posts!

This module also contains a `login` function to fetch your e621 api key, it currently isn't really useful, as the module doesn't use your api key, but if you need your e621 api key, you could use it for some reason. This will also set the current E6API instance's api key, but once again, it is not used.

### !!IMPORTANT!! - You MUST set a valid userAgent when using this module, and you MUST not use any default library useragents, e621 blocks almost all of the default userAgents, and will completely block you if you try to send too many requests with a default agent. We are NOT responsible if you get blocked by E621!

Example `login` function usage
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

e6.login("username", "password").then(res => console.log(res));
// if successful, it will print your hashed password (api key) to the console
```

both of the `getPostBy` functions support fetching the image while getting the info for it, if set to true, it will return an object structure like `{ image: (ImageBuffer), post: (PostInfo) }`
Example `getPostById` function usage, without fetching image
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//             post id, fetch image
e6.getPostById(1022094, false).then(res => console.log(res));

// if the post exists, this will log its info to the console, ex:
/*
{
	id: 1022094,
	tags: "2016 accessory alexis_velvet all_fours anthro balls_in_panties big_butt black_hair boy_shorts brown_fur bulge butt cervid clothed clothing fur furgonomics garter girly hair looking_at_viewer looking_back male mammal perineum presenting presenting_hindquarters rear_view smile solo spots tight_clothing underwear valkoinen",
	locked_tags: null,
	description: "Removed text tag",
	created_at: {
		json_class: "Time",
		s: 1476493528,
		n: 698320000
	},
	creator_id: 174059,
	author: "GameManiac",
	change: 21107428,
	source: "http://www.furaffinity.net/view/21429634/",
	score: 241,
	fav_count: 855,
	md5: "00304f67656e174b70c62160404464a7",
	file_size: 1081587,
	file_url: "https://static1.e621.net/data/00/30/00304f67656e174b70c62160404464a7.png",
	file_ext: "png",
	preview_url: "https://static1.e621.net/data/preview/00/30/00304f67656e174b70c62160404464a7.jpg",
	preview_width: 150,
	preview_height: 99,
	sample_url: "https://static1.e621.net/data/sample/00/30/00304f67656e174b70c62160404464a7.jpg",
	sample_width: 800,
	sample_height: 533,
	rating: "q",
	status: "active",
	width: 1280,
	height: 853,
	has_comments: true,
	has_notes: false,
	has_children: true,
	children: "1022673,1022680,1029501,1097929,1109018",
	parent_id: null,
	artist: ["valkoinen"],
	sources: ["http://www.furaffinity.net/view/21429634/",
		"http://www.furaffinity.net/user/valkoinen/",
		"http://d.facdn.net/art/valkoinen/1476493152/1476493152.valkoinen_clothed1280.png"
	]
}
*/
// if the post does not exist, it will return null
```

If `fetchImage` is set to `true`:
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//             post id, fetch image
e6.getPostById(1022094, true).then(res => console.log(res));

// if the post exists, this will log its info to the console, ex:
/*
{
	image: (ImageBuffer),
	post: (E621Post)
}
*/
// if the post does not exist, it will return null
```

the `getImageByMD5` function follows the same principal
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//               post md5,                         fetch image
e6.getPostByMD5("00304f67656e174b70c62160404464a7", false).then(res => console.log(res));

// if the post exists, this will log its info to the console, ex:
/*
{
	(E621Post)
}
*/
// if the post does not exist, it will return null
```

You can also just fetch the tags of posts, if you only need the tags
To fetch more about the post, you must use one of `getPostById` or `getPostByMD5`
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//                 post id
e6.getPostTagsById(1022094).then(res => console.log(res));

// if the post exists, it will return something like
/*
{
	id: 1022094,
  	tags: [{
		id: 2153,
       	name: "presenting",
       	count: 84694,
       	type: 0,
		type_locked: null
	}]
}*/
// tags will be an array of tags, with each having the same structure
// if the post does not exist, it will return null
```

md5 example
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//                  post md5
e6.getPostTagsByMD5("00304f67656e174b70c62160404464a7").then(res => console.log(res));

// if the post exists, it will return something like
/*
{
	md5: "00304f67656e174b70c62160404464a7",
  	tags: [{
		id: 2153,
       	name: "presenting",
       	count: 84694,
       	type: 0,
		type_locked: null
	}]
}*/
// tags will be an array of tags, with each having the same structure
// if the post does not exist, it will return null
```

`listPosts` function, you can use this almost the same as if you were searching on e621.net
parameters (none are required):
* `tags` - the tags to look for in posts (maximum of 6)
* `limit` - the maximum number of posts per page (max 320)
* `page` - the page to go to in the results (max 750)
* `beforeId` - look for posts before this post id
* `filterTags` - an array of tags to filter posts with, if a post contains any tags that are listed here, it will not be returned
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//           tags (max 6),           limit, page, beforeId, filterTags
e6.listPosts(["gay", "order:favcount"], 50,    1,     null, []).then(res => console.log(res));
// returns an array of posts matching the query, returns an empty array if none were found
```

this will return zero results, because all of them will have a tag that is filtered out
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

e6.listPosts(["gay"], null, null, null, ["male"]).then(res => console.log(res));
// in the console: []
```

fetch deleted posts:
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

//              page, user id
e6.getDeletedPosts(1, null).then(res => console.log(res));
// will return an array of entries like
/*
{
	id: number,
	creator_id: number,
	tags: string.
	delreason: string
}
*/
```

get the most popular posts on e621
```js
const E6API = require("E6API");
const e6 = new E6API({
	userAgent: "E6API/1.0.4 (https://github.com/FurryBotCo/E6API)"
});

// valid values are "day", "week", and "month"
e6.getPopularPosts("month").then(res => console.log(res));
// will return an array of e621 posts
```